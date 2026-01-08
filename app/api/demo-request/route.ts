import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, companyName, jobTitle, teamSize, phone, howHeard } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !companyName || !jobTitle || !teamSize || !howHeard) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    // Insert demo request into database
    const { error } = await supabase.from("demo_requests").insert({
      first_name: firstName,
      last_name: lastName,
      email,
      company_name: companyName,
      job_title: jobTitle,
      team_size: teamSize,
      phone: phone || null,
      how_heard: howHeard,
    });

    if (error) {
      console.error("Error saving demo request:", error);
      // If table doesn't exist, just log and return success for now
      if (error.code === "42P01") {
        console.log("Demo request received (table not set up):", body);
        return NextResponse.json({ success: true });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Demo request error:", error);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
