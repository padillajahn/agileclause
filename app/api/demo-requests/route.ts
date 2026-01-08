import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile with role from roles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, roles(name)")
      .eq("id", user.id)
      .single();

    const roleName = (profile?.roles as any)?.name;
    if (roleName !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch demo requests
    const { data: requests, error } = await supabase
      .from("demo_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ requests: requests || [] });
  } catch (error) {
    console.error("Error fetching demo requests:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
