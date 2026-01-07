import { NextResponse } from "next/server";

export async function GET() {
  // Return empty templates list (in production, fetch from database)
  return NextResponse.json({ templates: [] });
}

export async function POST(req: Request) {
  try {
    const { name, body } = await req.json();

    const now = new Date().toISOString();
    const template = {
      id: crypto.randomUUID(),
      name: String(name || "").trim(),
      body: body ?? "",
      created_at: now,
      updated_at: now,
    };

    if (!template.name) {
      return NextResponse.json({ error: "Template name is required" }, { status: 400 });
    }

    return NextResponse.json({ template });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Create failed" }, { status: 500 });
  }
}
