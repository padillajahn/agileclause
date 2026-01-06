import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { saveDoc } from "../../../lib/store";

export const runtime = "nodejs"; // required for Buffer/pdf-parse/crypto on Next.js

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const id = randomUUID();
    const filename = (file.name || "document").toLowerCase();
    const mime = (file.type || "").toLowerCase();

    // Convert the browser File -> Node Buffer
    const ab = await file.arrayBuffer();
    const buffer = Buffer.from(ab);

    if (!buffer || buffer.length === 0) {
      return NextResponse.json({ error: "Empty file uploaded" }, { status: 400 });
    }

    let text = "";

    // --- TXT ---
    if (mime.startsWith("text/") || filename.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    }
    // --- PDF ---
else if (mime.includes("pdf") || filename.endsWith(".pdf")) {
  try {
    // Force CJS require so we definitely get the function export
    const { createRequire } = await import("module");
    const require = createRequire(import.meta.url);
    const pdfParse = require("pdf-parse"); // <- CJS require, not ESM import

    // Safety: make sure we really have bytes
    if (!buffer || buffer.length === 0) {
      return NextResponse.json(
        { error: "Empty PDF uploaded (0 bytes)" },
        { status: 400 }
      );
    }

    const data = await pdfParse(buffer); // MUST pass the Buffer
    const out = (data?.text || "").trim();
    if (!out) {
      return NextResponse.json(
        { error: "PDF parsed, but no selectable text found (likely a scanned image). OCR required." },
        { status: 422 }
      );
    }
    text = out;
  } catch (e: any) {
    return NextResponse.json(
      { error: `PDF parsing failed: ${e?.message || "unknown error"}` },
      { status: 500 }
    );
  }
}
    // --- DOCX ---
    else if (mime.includes("wordprocessingml") || filename.endsWith(".docx")) {
      try {
        const mammoth: any = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        text = (result?.value || "").trim();
        if (!text) {
          return NextResponse.json(
            { error: "DOCX parsed, but no text extracted." },
            { status: 422 }
          );
        }
      } catch (e: any) {
        return NextResponse.json(
          { error: `DOCX parsing failed: ${e?.message || "unknown error"}` },
          { status: 500 }
        );
      }
    }
    // --- Unsupported ---
    else {
      return NextResponse.json(
        { error: "Unsupported file type. Upload .txt, .pdf, or .docx (not .doc)." },
        { status: 415 }
      );
    }

    saveDoc({ id, filename, text, uploadedAt: Date.now() });
    return NextResponse.json({ document_id: id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: "POST a FormData with a 'file' field (.txt, .pdf, or .docx)",
  });
}
