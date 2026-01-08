import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are a helpful legal assistant for AgileClause, an AI-powered contract analysis platform. You help users with:

1. Contract Analysis - Reviewing and analyzing legal documents
2. Legal Research - Answering questions about legal concepts, clauses, and best practices
3. Document Drafting - Helping draft legal documents, contracts, and clauses
4. Risk Assessment - Identifying potential risks in contracts and legal agreements
5. Compliance Guidance - Providing guidance on regulatory compliance

When responding:
- Be professional, clear, and concise
- Cite relevant sources when applicable
- If the user has uploaded documents, reference specific sections when answering questions about them
- If drafting content, follow standard legal conventions
- Always remind users that you are an AI assistant and they should consult a licensed attorney for legal advice
- If you're unsure about something, acknowledge it and suggest consulting a legal professional

When the user has uploaded documents, analyze them carefully and provide detailed insights based on the document content.`;

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

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Extract text content from response
    const textContent = response.content.find(block => block.type === "text");
    const responseText = textContent?.type === "text" ? textContent.text : "I apologize, but I couldn't generate a response.";

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
