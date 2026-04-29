import { NextRequest, NextResponse } from "next/server";
import { getDoc } from "@/lib/store";

export const runtime = "nodejs";

type Goal = "risk" | "negotiate" | "favorable" | "standard" | "summary";

const VALID_GOALS: Goal[] = ["risk", "negotiate", "favorable", "standard", "summary"];

const GOAL_INSTRUCTIONS: Record<Goal, string> = {
  risk:
    "Goal: Conduct a careful risk review. Surface every meaningful legal, financial, operational, and compliance risk in this contract. Be specific about which clause causes each risk and the concrete consequence to the user. Rank risks High / Medium / Low based on likelihood and business impact.",
  negotiate:
    "Goal: Prepare the user for negotiation. Identify the most important terms to push back on, what the counterparty is likely to concede vs. fight on, and concrete redlines. Be tactical and prioritize high-leverage items.",
  favorable:
    "Goal: Make this contract more favorable to the user (the party reviewing it). Suggest concrete clause edits and replacement language that shift risk away from the user, tighten counterparty obligations, and improve commercial terms.",
  standard:
    "Goal: Assess whether this contract is standard for its type. Call out clauses that are unusual, off-market, vague, or one-sided compared to typical industry practice, and note where standard clauses are missing or weaker than market.",
  summary:
    "Goal: Create a client-ready summary. Translate the contract into plain English a non-lawyer business owner can act on. Highlight obligations, deliverables, key dates, money terms, termination, IP, liability, and the top risks. Be concise and concrete.",
};

const SYSTEM_PROMPT = `You are a careful legal workflow assistant acting as a junior associate doing contract review.
You are NOT a lawyer. Your output is for attorney review and does not constitute legal advice.
Be specific, practical, and actionable. Focus on real business and legal risk.
Avoid vague platitudes such as "consider reviewing this clause" — instead say WHAT is wrong, WHY it matters, and WHAT to change.
Return ONLY valid JSON matching the requested schema. Do not wrap in markdown.`;

function buildUserPrompt(goal: Goal, contractText: string, userContext?: string) {
  const trimmed = contractText.slice(0, 16000);
  return `${GOAL_INSTRUCTIONS[goal]}

${userContext ? `Additional user context:\n${userContext}\n\n` : ""}Contract text:
---
${trimmed}
---

Return a single JSON object with this exact shape and field names:
{
  "agentSummary": string,
  "keyRisks": [{ "severity": "High" | "Medium" | "Low", "title": string, "explanation": string }],
  "missingClauses": [{ "title": string, "explanation": string }],
  "negotiationPoints": string[],
  "suggestedEdits": [{ "originalIssue": string, "suggestedLanguage": string }],
  "clientEmailDraft": string
}

Rules:
- Always include every field. If a category does not apply, return an empty array (or empty string).
- "agentSummary" must end with: "This output is for attorney review and does not constitute legal advice."
- "clientEmailDraft" should be a short, professional email summarizing the review and proposed next steps. Sign it generically (e.g., "Best regards,").
- Be specific. Reference clause names or quoted phrases where possible.`;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server is missing OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({} as any));
    const { documentId, contractText: rawText, selectedGoal, userContext } = body || {};

    if (!selectedGoal || !VALID_GOALS.includes(selectedGoal)) {
      return NextResponse.json(
        { error: `selectedGoal is required and must be one of: ${VALID_GOALS.join(", ")}` },
        { status: 400 }
      );
    }

    let text = "";
    if (typeof rawText === "string" && rawText.trim().length > 0) {
      text = rawText;
    } else if (documentId) {
      const doc = getDoc(String(documentId));
      if (!doc) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }
      text = doc.text;
    } else {
      return NextResponse.json(
        { error: "Provide either documentId or contractText." },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "Contract text is empty." }, { status: 400 });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(selectedGoal as Goal, text, userContext) },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const details = await openaiRes.text().catch(() => "");
      return NextResponse.json(
        { error: "OpenAI request failed", details },
        { status: 502 }
      );
    }

    const data = await openaiRes.json();
    const raw = data?.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      return NextResponse.json({ error: "Empty response from model." }, { status: 502 });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Model returned invalid JSON." }, { status: 502 });
    }

    const result = {
      agentSummary: typeof parsed.agentSummary === "string" ? parsed.agentSummary : "",
      keyRisks: Array.isArray(parsed.keyRisks)
        ? parsed.keyRisks
            .filter((r: any) => r && typeof r === "object")
            .map((r: any) => ({
              severity:
                r.severity === "High" || r.severity === "Medium" || r.severity === "Low"
                  ? r.severity
                  : "Medium",
              title: String(r.title ?? ""),
              explanation: String(r.explanation ?? ""),
            }))
        : [],
      missingClauses: Array.isArray(parsed.missingClauses)
        ? parsed.missingClauses
            .filter((c: any) => c && typeof c === "object")
            .map((c: any) => ({
              title: String(c.title ?? ""),
              explanation: String(c.explanation ?? ""),
            }))
        : [],
      negotiationPoints: Array.isArray(parsed.negotiationPoints)
        ? parsed.negotiationPoints.map((p: any) => String(p ?? "")).filter(Boolean)
        : [],
      suggestedEdits: Array.isArray(parsed.suggestedEdits)
        ? parsed.suggestedEdits
            .filter((e: any) => e && typeof e === "object")
            .map((e: any) => ({
              originalIssue: String(e.originalIssue ?? ""),
              suggestedLanguage: String(e.suggestedLanguage ?? ""),
            }))
        : [],
      clientEmailDraft:
        typeof parsed.clientEmailDraft === "string" ? parsed.clientEmailDraft : "",
    };

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Agent review failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: "POST JSON { documentId | contractText, selectedGoal, userContext? } where selectedGoal is one of: risk, negotiate, favorable, standard, summary.",
  });
}
