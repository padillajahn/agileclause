import { NextResponse } from "next/server";
import { getDoc } from "@/lib/store";

export const runtime = "nodejs";

const SYSTEM = `You are a careful legal workflow assistant doing first-pass contract review.
You are not a lawyer. Output is for attorney review and is not legal advice.
Be specific and concrete. Avoid vague platitudes.
Return ONLY valid JSON.`;

function buildUserPrompt(text: string) {
  return `Analyze this contract and return a JSON object with:
- "risks": array of 3-7 short strings, each describing a real legal/financial/operational risk in this contract
- "keyClauses": array of 3-8 short strings naming clause types present (e.g., "Indemnification", "Termination for convenience", "Limitation of liability")
- "summary": 2-3 sentence plain-English overview of what this contract does and the most important obligations

Contract:
---
${text.slice(0, 14000)}
---`;
}

export async function POST(req: Request) {
  try {
    const { document_id } = await req.json().catch(() => ({} as any));
    if (!document_id) {
      return NextResponse.json({ error: "Missing document_id" }, { status: 400 });
    }

    const doc = getDoc(String(document_id));
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // No key configured — return text only so the UI still shows the contract
      return NextResponse.json({
        fullText: doc.text,
        risks: [],
        keyClauses: [],
        summary: "",
      });
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: buildUserPrompt(doc.text) },
        ],
      }),
    });

    if (!res.ok) {
      // OpenAI failed — still return the text so the UI works
      return NextResponse.json({
        fullText: doc.text,
        risks: [],
        keyClauses: [],
        summary: "",
      });
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content?.trim();
    let parsed: any = {};
    try {
      parsed = JSON.parse(raw || "{}");
    } catch {
      parsed = {};
    }

    return NextResponse.json({
      fullText: doc.text,
      risks: Array.isArray(parsed.risks)
        ? parsed.risks.map((r: any) => String(r)).filter(Boolean)
        : [],
      keyClauses: Array.isArray(parsed.keyClauses)
        ? parsed.keyClauses.map((k: any) => String(k)).filter(Boolean)
        : [],
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Analyze failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: "POST { document_id } — returns { fullText, risks, keyClauses, summary }",
  });
}
