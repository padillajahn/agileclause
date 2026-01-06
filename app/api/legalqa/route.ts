// app/api/legalqa/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // use Node so we can call external APIs reliably

// --- OpenAI-backed legal Q&A (general, not tied to a document) ---
async function answerWithOpenAI(question: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const system = `You are an expert contracts attorney assistant.
Provide practical, neutral guidance for general legal questions.
Do NOT provide definitive legal advice, case citations, or jurisdiction-specific rules unless asked.
Answer concisely (4-8 sentences).`;

  const user = `Question: ${question}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`OpenAI error (${res.status}): ${err || res.statusText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    const aiAnswer =
      (await answerWithOpenAI(question)) ||
      "Heuristic: Please provide more context (jurisdiction, contract type, risk tolerance).";

    // Mild safety reminder (not legal advice)
    const finalAnswer =
      aiAnswer +
      "\n\n—\nNote: This is general information, not legal advice. Consult counsel for your situation.";

    return NextResponse.json({ answer: finalAnswer });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Legal Q&A failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, hint: "POST { question }" });
}
