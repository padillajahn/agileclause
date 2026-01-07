import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendInviteEmail } from "@/lib/email";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all team members (profiles with roles)
    const { data: members, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, created_at, roles(name)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Get pending invitations
    const { data: invitations } = await supabase
      .from("invitations")
      .select("id, email, created_at, expires_at, roles(name)")
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString());

    return NextResponse.json({
      members: members?.map(m => ({
        id: m.id,
        name: m.full_name || m.email,
        email: m.email,
        role: (m.roles as any)?.name || "viewer",
        created_at: m.created_at
      })) || [],
      invitations: invitations?.map(i => ({
        id: i.id,
        email: i.email,
        role: (i.roles as any)?.name || "viewer",
        status: "pending",
        expires_at: i.expires_at,
        created_at: i.created_at
      })) || []
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to fetch team" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role_id, roles(name)")
      .eq("id", user.id)
      .single();

    if ((profile?.roles as any)?.name !== "admin") {
      return NextResponse.json({ error: "Only admins can invite team members" }, { status: 403 });
    }

    const { email, role } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get role ID
    const { data: roleData } = await supabase
      .from("roles")
      .select("id")
      .eq("name", role || "viewer")
      .single();

    if (!roleData) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Check if invitation already exists
    const { data: existingInvite } = await supabase
      .from("invitations")
      .select("id")
      .eq("email", email)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (existingInvite) {
      return NextResponse.json({ error: "Invitation already sent to this email" }, { status: 400 });
    }

    // Create invitation token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Insert invitation
    const { data: invitation, error } = await supabase
      .from("invitations")
      .insert({
        email,
        role_id: roleData.id,
        invited_by: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select("id, email, created_at, expires_at")
      .single();

    if (error) throw error;

    // Generate invite link
    const inviteLink = `${req.headers.get("origin") || "http://localhost:3000"}/invite/${token}`;

    // Get inviter's name for the email
    const { data: inviterProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    // Send invitation email
    const emailResult = await sendInviteEmail({
      to: email,
      inviteLink,
      role: role || "viewer",
      inviterName: inviterProfile?.full_name || inviterProfile?.email,
    });

    return NextResponse.json({
      invitation: {
        ...invitation,
        role,
        status: "pending",
        invite_link: inviteLink
      },
      message: emailResult.success
        ? `Invitation email sent to ${email}`
        : `Invitation created. Share this link with ${email}: ${inviteLink}`,
      emailSent: emailResult.success
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Invite failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role_id, roles(name)")
      .eq("id", user.id)
      .single();

    if ((profile?.roles as any)?.name !== "admin") {
      return NextResponse.json({ error: "Only admins can remove team members" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("id");
    const type = searchParams.get("type"); // "member" or "invitation"

    if (!memberId) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (type === "invitation") {
      const { error } = await supabase
        .from("invitations")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    } else {
      // Don't allow removing yourself
      if (memberId === user.id) {
        return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
      }

      // Remove user's profile (this will cascade due to foreign key)
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Remove failed" }, { status: 500 });
  }
}
