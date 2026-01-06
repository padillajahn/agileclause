import { NextResponse } from "next/server";
import { getDoc } from "../../../lib/store";

export const runtime = "nodejs"; // ensure Node runtime so memory is shared & Node APIs work

// --- OpenAI-powered analysis ---
async function analyzeWithOpenAI(text: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const system = `You are a contracts analyst. Extract JSON with:
  - risks: array of concise risk statements
  - keyClauses: array of important clauses present
  - missing: array of clauses that appear missing
  - summary: 2-3 sentence summary
Return ONLY valid JSON.`;

  const user = `Analyze this contract text:\n${text.slice(0, 8000)}`;

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
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  try {
    return JSON.parse(data.choices?.[0]?.message?.content || "{}");
  } catch {
    return null;
  }
}

// --- Heuristic fallback if no OpenAI ---
function analyzeHeuristic(text: string) {
  const lower = text.toLowerCase();
  const keyClauses = [
    "Confidentiality",
    "Payment Terms",
    "Term and Termination",
    "Governing Law",
    "Indemnification",
    "Limitation of Liability",
  ].filter((c) => lower.includes(c.toLowerCase()));

  const missing = ["Arbitration", "Limitation of Liability", "Data Protection"]
    .filter((c) => !lower.includes(c.toLowerCase()));

  const risks: string[] = [];
  if (lower.includes("indemnif") && lower.includes("unlimited")) risks.push("Indemnity appears unlimited.");
  if (lower.includes("terminate") && lower.includes("convenience")) risks.push("Counterparty can terminate for convenience.");
  if (lower.includes("liability") && (lower.includes("unlimited") || !lower.includes("cap"))) risks.push("Liability cap is missing or unlimited.");
  if (risks.length === 0) risks.push("No obvious risks detected via heuristic scan.");

  const summary = "Heuristic summary: basic clause scan completed. Add OPENAI_API_KEY for higher quality.";
  return { risks, keyClauses, missing, summary };
}

// --- POST handler ---
export async function POST(req: Request) {
  try {
    const { document_id } = await req.json();
    if (!document_id) {
      return NextResponse.json({ error: "Missing document_id" }, { status: 400 });
    }

    const doc = getDoc(document_id);
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const ai = await analyzeWithOpenAI(doc.text);
    const { risks, keyClauses, missing, summary } = ai || analyzeHeuristic(doc.text);

    return NextResponse.json({
      risks,
      keyClauses,
      missing,
      summary,
      plainTextSnippet: doc.text.slice(0, 1200),
      fullText: doc.text, // <-- full contract text returned
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Analyze failed" }, { status: 500 });
  }
}

// --- GET handler (for quick ping tests) ---
export async function GET() {
  return NextResponse.json({ summary: "Analyze GET alive" });
}
