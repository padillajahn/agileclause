"use client";

import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Plus, Type, Trash2, Save, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

type TextAnnotation = {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  page: number;
};

type PdfEditorProps = {
  pdfData: string; // base64 data URL
  pdfFileName: string;
  onSave: (newPdfData: string) => void;
  onClose: () => void;
};

export default function PdfEditor({ pdfData, pdfFileName, onSave, onClose }: PdfEditorProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [annotations, setAnnotations] = useState<TextAnnotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [isAddingText, setIsAddingText] = useState(false);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function handlePageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!isAddingText || !pageRef.current) return;

    const rect = pageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const newAnnotation: TextAnnotation = {
      id: crypto.randomUUID(),
      x,
      y,
      text: "New text",
      fontSize: 12,
      page: currentPage,
    };

    setAnnotations([...annotations, newAnnotation]);
    setSelectedAnnotation(newAnnotation.id);
    setIsAddingText(false);
  }

  function updateAnnotation(id: string, updates: Partial<TextAnnotation>) {
    setAnnotations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  }

  function deleteAnnotation(id: string) {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    setSelectedAnnotation(null);
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Convert base64 to array buffer
      const base64Data = pdfData.split(",")[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Load the PDF
      const pdfDoc = await PDFDocument.load(bytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      // Add annotations to PDF
      for (const annotation of annotations) {
        if (annotation.page <= pages.length) {
          const page = pages[annotation.page - 1];
          const { height } = page.getSize();

          // Convert screen coordinates to PDF coordinates (PDF origin is bottom-left)
          page.drawText(annotation.text, {
            x: annotation.x,
            y: height - annotation.y - annotation.fontSize,
            size: annotation.fontSize,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
        }
      }

      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      const reader = new FileReader();

      reader.onload = () => {
        onSave(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error saving PDF:", error);
      alert("Failed to save PDF. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const currentPageAnnotations = annotations.filter((a) => a.page === currentPage);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-medium">{pdfFileName}</h3>
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 hover:bg-slate-700 rounded disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>
              Page {currentPage} of {numPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
              disabled={currentPage >= numPages}
              className="p-1 hover:bg-slate-700 rounded disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            className="p-2 text-slate-300 hover:bg-slate-700 rounded"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-slate-300 text-sm w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(2, s + 0.1))}
            className="p-2 text-slate-300 hover:bg-slate-700 rounded"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <div className="w-px h-6 bg-slate-600 mx-2" />

          <button
            onClick={() => setIsAddingText(!isAddingText)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded text-sm ${
              isAddingText
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Type className="h-4 w-4" />
            Add Text
          </button>

          <div className="w-px h-6 bg-slate-600 mx-2" />

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save PDF"}
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 text-slate-300 hover:bg-slate-700 rounded text-sm"
          >
            Close
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF Viewer */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto flex justify-center p-8 bg-slate-700"
        >
          <div
            ref={pageRef}
            className={`relative bg-white shadow-xl ${isAddingText ? "cursor-crosshair" : ""}`}
            onClick={handlePageClick}
          >
            <Document file={pdfData} onLoadSuccess={onDocumentLoadSuccess}>
              <Page pageNumber={currentPage} scale={scale} />
            </Document>

            {/* Render annotations */}
            {currentPageAnnotations.map((annotation) => (
              <div
                key={annotation.id}
                className={`absolute cursor-move ${
                  selectedAnnotation === annotation.id
                    ? "ring-2 ring-blue-500"
                    : "hover:ring-2 hover:ring-blue-300"
                }`}
                style={{
                  left: annotation.x * scale,
                  top: annotation.y * scale,
                  fontSize: annotation.fontSize * scale,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAnnotation(annotation.id);
                }}
              >
                <span className="text-black whitespace-pre">{annotation.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Properties panel */}
        {selectedAnnotation && (
          <div className="w-72 bg-slate-800 border-l border-slate-700 p-4 overflow-auto">
            <h4 className="text-white font-medium mb-4">Text Properties</h4>
            {(() => {
              const annotation = annotations.find((a) => a.id === selectedAnnotation);
              if (!annotation) return null;

              return (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Text Content</label>
                    <textarea
                      value={annotation.text}
                      onChange={(e) => updateAnnotation(annotation.id, { text: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-blue-500 text-sm"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Font Size</label>
                    <input
                      type="number"
                      value={annotation.fontSize}
                      onChange={(e) =>
                        updateAnnotation(annotation.id, {
                          fontSize: Math.max(8, Math.min(72, parseInt(e.target.value) || 12)),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-blue-500 text-sm"
                      min={8}
                      max={72}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 text-sm mb-1">X Position</label>
                      <input
                        type="number"
                        value={Math.round(annotation.x)}
                        onChange={(e) =>
                          updateAnnotation(annotation.id, { x: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-1">Y Position</label>
                      <input
                        type="number"
                        value={Math.round(annotation.y)}
                        onChange={(e) =>
                          updateAnnotation(annotation.id, { y: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAnnotation(annotation.id)}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Text
                  </button>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Instructions */}
      {isAddingText && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          Click anywhere on the PDF to add text
        </div>
      )}
    </div>
  );
}
