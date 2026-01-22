import { NextResponse } from "next/server";

export async function GET() {
  // Return default settings (in production, fetch from database)
  return NextResponse.json({
    settings: {
      productName: "AgileClause",
      primaryColor: "#2563eb",
      policy: {
        governingLaw: "Delaware",
        liabilityCap: "1x fees",
        arbitration: "Required",
      },
    },
  });
}

export async function POST(req: Request) {
  try {
    const settings = await req.json();
    // In production, save to database
    return NextResponse.json({ settings });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
