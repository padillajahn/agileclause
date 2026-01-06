import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, role } = await req.json();
    return NextResponse.json({
      member: { id: crypto.randomUUID(), name, role }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Invite failed" }, { status: 500 });
  }
}
