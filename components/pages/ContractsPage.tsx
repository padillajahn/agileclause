"use client";

import React from "react";
import {
  Upload,
  FileText,
  ArrowUpRight,
  Trash2,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { PageHero, SectionHeader } from "../ui/SectionHeader";
import { Card } from "../ui/Card";
import { Badge, RiskBadge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { MetricCard } from "../ui/MetricCard";
import { EmptyState } from "../ui/EmptyState";
import type { Insights, WorkspaceDoc } from "./types";

type Props = {
  selectedFile: File | null;
  loading: boolean;
  errorMsg: string;
  warningMsg: string;
  documentId: string | null;
  contractText: string;
  aiInsights: Insights | null;
  workspace: WorkspaceDoc[];
  uploadInputId: string;
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenAnalysis: (doc: WorkspaceDoc) => void;
  onRemoveFromWorkspace: (id: string) => void;
  onGoToAgent: () => void;
};

export default function ContractsPage(props: Props) {
  const {
    selectedFile,
    loading,
    errorMsg,
    warningMsg,
    documentId,
    contractText,
    aiInsights,
    workspace,
    uploadInputId,
    fileInputRef,
    onOpenAnalysis,
    onRemoveFromWorkspace,
    onGoToAgent,
  } = props;

  const [dragActive, setDragActive] = React.useState(false);

  const reviewed = workspace.filter((d) => d.status === "Analyzed").length;
  const high = workspace.filter((d) => d.riskLevel === "High").length;
  const sorted = [...workspace].sort(
    (a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0),
  );
  const recent = sorted.slice(0, 5);

  // Drop handler — set the file on the input, then dispatch a change event so React onChange fires.
  function onDropFile(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      fileInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  // Reusable label-styled-as-button — clicking opens the file picker reliably.
  const labelBase =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition cursor-pointer";
  const labelPrimary = `${labelBase} px-2.5 py-1.5 text-xs bg-slate-900 text-white border border-slate-900 hover:bg-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.08)]`;
  const labelSecondary = `${labelBase} px-2.5 py-1.5 text-xs bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300`;

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Workspace"
        title="Contract Intelligence"
        description="Upload contracts, run AI review, and track risk across your portfolio. All analysis is for attorney review and is not legal advice."
      >
        <label htmlFor={uploadInputId} className={labelSecondary}>
          <Upload className="h-3.5 w-3.5" /> Upload
        </label>
        <Button variant="primary" size="sm" onClick={onGoToAgent} disabled={!documentId}>
          <Sparkles className="h-3.5 w-3.5" /> Run Agent
        </Button>
      </PageHero>

      {/* Banners */}
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50/70 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}
      {!errorMsg && warningMsg && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-800">
          {warningMsg}
        </div>
      )}
      {loading && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-sm text-blue-800">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
          </span>
          Uploading and analyzing — this can take ~10 seconds.
        </div>
      )}

      {/* Metric row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Contracts"
          value={workspace.length}
          hint={workspace.length === 1 ? "in workspace" : "in workspace"}
          icon={FileText}
        />
        <MetricCard
          label="AI reviewed"
          value={reviewed}
          hint={`${workspace.length - reviewed} pending`}
          icon={Sparkles}
        />
        <MetricCard label="High risk" value={high} hint="flagged this session" />
      </div>

      {/* Upload card */}
      <Card padded={false}>
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200/60 px-6 py-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">Upload</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              PDF, DOCX, or TXT · auto-analyzed on upload
            </p>
            {selectedFile && (
              <p className="mt-1 text-[11px] text-slate-400">Selected: {selectedFile.name}</p>
            )}
          </div>
          <label htmlFor={uploadInputId} className={labelPrimary}>
            <Upload className="h-3.5 w-3.5" /> Choose file
          </label>
        </div>

        <label
          htmlFor={uploadInputId}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDropFile}
          className={`m-6 mt-4 block cursor-pointer rounded-xl border border-dashed bg-gradient-to-b transition ${
            dragActive
              ? "border-blue-300 from-blue-50/70 to-white"
              : "border-slate-200 from-slate-50/40 to-white hover:border-slate-300"
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200/80 shadow-sm">
              <Upload className="h-4 w-4 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              Drag & drop your contract here
            </p>
            <p className="text-xs text-slate-500">
              or click to browse · max ~16,000 words analyzed
            </p>
          </div>
        </label>
      </Card>

      {/* Recent contracts table */}
      <div>
        <SectionHeader
          eyebrow="Library"
          title="Recent contracts"
          description={`Last ${recent.length} of ${workspace.length} ${
            workspace.length === 1 ? "contract" : "contracts"
          }`}
          className="mb-4"
        />
        <Card padded={false}>
          {recent.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No contracts yet"
              description="Upload your first contract to start running AI review and tracking risk across your book."
              action={
                <label htmlFor={uploadInputId} className={labelPrimary}>
                  <Upload className="h-3.5 w-3.5" /> Upload contract
                </label>
              }
            />
          ) : (
            <div className="overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200/60 text-[11px] font-medium uppercase tracking-widest text-slate-500">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Uploaded</th>
                    <th className="px-3 py-3">Risk</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recent.map((doc) => {
                    const isActive = doc.id === documentId;
                    return (
                      <tr
                        key={doc.id}
                        className={`group transition ${
                          isActive ? "bg-blue-50/30" : "hover:bg-slate-50/60"
                        }`}
                      >
                        <td className="max-w-xs px-6 py-3">
                          <div className="flex items-center gap-2.5">
                            <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <div className="min-w-0">
                              <p
                                className="truncate font-medium text-slate-900"
                                title={doc.name}
                              >
                                {doc.name}
                              </p>
                              {isActive && (
                                <p className="text-[10px] uppercase tracking-widest text-blue-600">
                                  Active
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-600">
                          <Badge variant="neutral">{doc.type || "Contract"}</Badge>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500">
                          {doc.date}
                        </td>
                        <td className="px-3 py-3">
                          <RiskBadge level={doc.riskLevel ?? null} />
                        </td>
                        <td className="px-3 py-3">
                          <Badge
                            variant={doc.status === "Analyzed" ? "green" : "amber"}
                            dot
                          >
                            {doc.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => onOpenAnalysis(doc)}
                              disabled={doc.status !== "Analyzed"}
                            >
                              View <ChevronRight className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => onRemoveFromWorkspace(doc.id)}
                              aria-label="Remove"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Active contract detail */}
      {(contractText || loading) && (
        <div>
          <SectionHeader
            eyebrow="Active contract"
            title="Document detail"
            description="Extracted text and first-pass insights"
            className="mb-4"
            action={
              <Button variant="accent" size="sm" onClick={onGoToAgent} disabled={!documentId}>
                <Sparkles className="h-3.5 w-3.5" /> Run Agent
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            }
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card padded={false} className="lg:col-span-2">
              <div className="border-b border-slate-200/60 px-6 py-3.5">
                <h4 className="text-sm font-semibold tracking-tight text-slate-900">
                  Contract text
                </h4>
              </div>
              <div className="max-h-[60vh] overflow-auto whitespace-pre-wrap px-6 py-5 text-[13px] leading-relaxed text-slate-700">
                {contractText ||
                  (loading
                    ? "Analyzing contract…"
                    : "Upload a contract to see extracted text here.")}
              </div>
            </Card>
            <Card padded={false} className="flex flex-col">
              <div className="border-b border-slate-200/60 px-6 py-3.5">
                <h4 className="text-sm font-semibold tracking-tight text-slate-900">
                  First-pass insights
                </h4>
                <p className="mt-0.5 text-xs text-slate-500">
                  Send to Agent for goal-based review
                </p>
              </div>
              <div className="flex-1 px-6 py-5">
                {!aiInsights && !loading && (
                  <p className="text-xs text-slate-500">No insights yet.</p>
                )}
                {aiInsights && (
                  <div className="space-y-5 text-sm text-slate-800">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
                        Flagged risks
                      </p>
                      {aiInsights.risks.length === 0 ? (
                        <p className="mt-1 text-xs text-slate-500">None flagged.</p>
                      ) : (
                        <ul className="mt-2 space-y-1.5 text-xs">
                          {aiInsights.risks.map((r, i) => (
                            <li key={i} className="flex gap-2 text-slate-700">
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-400" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
                        Key clauses
                      </p>
                      <ul className="mt-2 space-y-1.5 text-xs">
                        {aiInsights.keyClauses.map((k, i) => (
                          <li key={i} className="flex gap-2 text-slate-700">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                            <span>{k}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
                        Summary
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-slate-700">
                        {aiInsights.summary}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
