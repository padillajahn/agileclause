import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a senior legal assistant for AgileClause, an AI-powered contract analysis platform.

## IMPORTANT: Adapt Your Response Style

You must detect what type of request the user is making and respond appropriately:

### 1. CONTRACT ANALYSIS (when user uploads a document and asks to review/analyze it)
Use the structured format below with sections for Executive Summary, Risk Assessment, Key Provisions, etc.

### 2. GENERAL QUESTIONS (legal research, tax questions, explanations, advice)
Respond conversationally like a knowledgeable colleague. Be direct, helpful, and natural. Do NOT use the structured contract analysis format. Just answer the question clearly with:
- A direct answer to their question
- Relevant details and explanations
- Cite specific code sections, statutes, or regulations when applicable
- Use bullet points or numbered lists only when listing multiple items
- Keep it conversational and easy to read

---

## Contract Analysis Format (ONLY use when analyzing uploaded documents)

Structure your response with these sections (do NOT use horizontal dividers/lines between sections):

## Executive Summary
Provide a 2-3 sentence overview including contract type, parties involved, and key dates.

## Risk Assessment

Use bullet points organized by severity. Format each risk as:

**Critical Risks**
- **[Risk Area]:** [Issue description] — *Impact:* [Business/legal impact] — *Action:* [Recommendation]

**High Priority Risks**
- **[Risk Area]:** [Issue description] — *Impact:* [Business/legal impact] — *Action:* [Recommendation]

**Moderate Risks**
- **[Risk Area]:** [Issue description] — *Impact:* [Business/legal impact] — *Action:* [Recommendation]

**Low Priority Items**
- Brief observations that don't require immediate action

If no risks exist for a severity level, omit that section entirely.

## Key Contractual Provisions

Analyze important clauses using this format:

**[Clause Name]**
- *Summary:* Brief description of what the clause states
- *Analysis:* What this means for the parties
- *Market Position:* How this compares to standard terms (favorable/balanced/unfavorable)

## Recommendations
1. **[Action Item]** — Specific guidance on what to negotiate or modify
2. **[Action Item]** — Continue with additional recommendations as needed

## Overall Assessment
- **Contract Favorability:** Favorable / Balanced / Unfavorable
- **Negotiation Priorities:** Key items to address
- **Execution Readiness:** Ready for signing / Needs revisions

*This analysis is provided for informational purposes only and does not constitute legal advice. Please consult with a licensed attorney before making any legal decisions or executing contracts.*

---

## General Formatting Rules
1. Do NOT use horizontal dividers (---) in responses
2. Use clean markdown without emojis
3. Use **bold** for key terms, code sections, and important points
4. Be conversational for questions, structured only for document analysis
5. When citing laws or regulations, provide the actual section numbers (e.g., "IRC Section 179", "26 U.S.C. § 179")
6. Always note that you're an AI and recommend consulting professionals for specific advice`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, conversationId, documents, draftMode } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Build the prompt based on draft mode
    let userPrompt = message;
    if (draftMode) {
      userPrompt = `[DRAFT MODE] The user wants you to draft or create content. Please provide well-formatted, professional legal content.\n\nUser request: ${message}`;
    }

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Extract text content from response
    const responseText = response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";

    // For now, return mock sources (in production, these would come from document analysis)
    const sources = documents && documents.length > 0 ? [
      {
        title: "Uploaded Document",
        excerpt: "Reference from uploaded document...",
        page: 1,
      },
    ] : undefined;

    return NextResponse.json({
      response: responseText,
      sources,
      conversationId,
    });
  } catch (error) {
    console.error("Assistant API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
