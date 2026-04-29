"use client";

import React from "react";
import { Search, FileText, Database, Sparkles } from "lucide-react";
import { PageHero, SectionHeader } from "../ui/SectionHeader";
import { Card } from "../ui/Card";
import { Badge, RiskBadge } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";
import type { WorkspaceDoc } from "./types";

type Props = {
  workspace: WorkspaceDoc[];
  onOpenAnalysis: (doc: WorkspaceDoc) => void;
};

export default function KnowledgePage({ workspace, onOpenAnalysis }: Props) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return workspace;
    return workspace.filter((d) => {
      if (d.name.toLowerCase().includes(q)) return true;
      if (d.fullText && d.fullText.toLowerCase().includes(q)) return true;
      if (d.type && d.type.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [workspace, query]);

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Knowledge"
        title="Document Memory"
        description="Search every contract you've reviewed. Firm-wide knowledge — clause libraries, precedents, and answer history — is being added next."
      />

      {/* Search */}
      <Card padded={false}>
        <div className="px-6 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search filenames, types, and contract text…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {workspace.length === 0
              ? "No documents yet."
              : `Showing ${filtered.length} of ${workspace.length} ${
                  workspace.length === 1 ? "document" : "documents"
                }`}
          </p>
        </div>
      </Card>

      {/* Library */}
      <div>
        <SectionHeader
          eyebrow="Library"
          title="Documents"
          description="Open any contract to revisit its analysis"
          className="mb-4"
        />

        {filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={Database}
              title={workspace.length === 0 ? "Your library is empty" : "No matches"}
              description={
                workspace.length === 0
                  ? "Upload contracts in the Contracts tab — they'll appear here for cross-document search and review."
                  : "Try a different keyword or contract type."
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((doc) => (
              <Card
                key={doc.id}
                interactive
                padded={false}
                onClick={() => doc.status === "Analyzed" && onOpenAnalysis(doc)}
                className={doc.status !== "Analyzed" ? "opacity-70" : ""}
              >
                <div className="border-b border-slate-200/60 px-5 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-200/80">
                        <FileText className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-semibold tracking-tight text-slate-900"
                          title={doc.name}
                        >
                          {doc.name}
                        </p>
                        <p className="text-[11px] text-slate-500">{doc.date}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="neutral">{doc.type || "Contract"}</Badge>
                    <RiskBadge level={doc.riskLevel ?? null} />
                  </div>
                  <Badge variant={doc.status === "Analyzed" ? "green" : "amber"} dot>
                    {doc.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Coming soon */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 ring-1 ring-amber-200/80">
            <Sparkles className="h-4 w-4 text-amber-700" />
          </div>
          <div>
            <Badge variant="gold">Coming soon</Badge>
            <h3 className="mt-2 text-sm font-semibold tracking-tight text-slate-900">
              Firm-wide knowledge layer
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Cross-document clause libraries, answer history shared across the team, and the
              ability to ask the agent questions over your entire contract portfolio at once.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
