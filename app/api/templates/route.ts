import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, body } = await req.json();

    const template = {
      id: crypto.randomUUID(),
      name: String(name || "").trim(),
      body: body ?? "",
      createdAt: new Date().toISOString(),
    };

    if (!template.name) {
      return NextResponse.json({ error: "Template name is required" }, { status: 400 });
    }

    return NextResponse.json({ template });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Create failed" }, { status: 500 });
  }
}
