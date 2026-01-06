import { NextResponse } from "next/server";
import { getDoc } from "../../../lib/store"; // <-- relative path

async function answerWithOpenAI(text: string, question: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const system = "Answer strictly from the contract text. If not found, say you can't find it. Be concise.";
  const user = `Contract:
---
${text.slice(0, 8000)}
---
Question: ${question}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      temperature: 0.2,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

function answerHeuristic(text: string, question: string) {
  const q = question.toLowerCase();
  const lines = text.split(/\r?\n/);
  const keywords = q.split(/\W+/).filter(Boolean).slice(0, 4);
  const hits = lines.filter(ln => keywords.some(k => ln.toLowerCase().includes(k))).slice(0, 5);
  if (!hits.length) return "I couldn’t find a direct answer in the uploaded text.";
  return `From the contract:\n- ${hits.join("\n- ")}`;
}

export async function POST(req: Request) {
  try {
    const { document_id, question } = await req.json();
    if (!document_id || !question) return NextResponse.json({ error: "Missing document_id or question" }, { status: 400 });

    const doc = getDoc(document_id);
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    const ans = (await answerWithOpenAI(doc.text, question)) || answerHeuristic(doc.text, question);
    return NextResponse.json({ answer: ans });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "QA failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const document_id = searchParams.get("document_id");
  const question = searchParams.get("question");
  if (!document_id || !question) return NextResponse.json({ answer: "qa GET alive" });
  const doc = getDoc(document_id);
  if (!doc) return NextResponse.json({ answer: "Document not found" }, { status: 404 });
  return NextResponse.json({ answer: answerHeuristic(doc.text, question) });
}
