"use client";

import React from "react";
import {
  Sparkles,
  Copy,
  MessageSquare,
  Search,
  FileText,
  ArrowRight,
  ShieldAlert,
  Handshake,
  Scale,
  CheckCircle2,
  Mail,
  AlertTriangle,
  ListChecks,
  PenLine,
} from "lucide-react";
import { PageHero, SectionHeader } from "../ui/SectionHeader";
import { Card, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import type { AgentGoal, AgentResult } from "./types";

const AGENT_GOALS: {
  id: AgentGoal;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "risk",
    label: "Review for risk",
    hint: "Flag legal, financial, and operational risk across the contract.",
    icon: ShieldAlert,
  },
  {
    id: "negotiate",
    label: "Prepare for negotiation",
    hint: "Identify high-leverage items to push back on.",
    icon: Handshake,
  },
  {
    id: "favorable",
    label: "Make it more favorable",
    hint: "Shift risk away and propose redlines in your favor.",
    icon: Scale,
  },
  {
    id: "standard",
    label: "Check if standard",
    hint: "Compare to typical market terms; flag what's off-market.",
    icon: CheckCircle2,
  },
  {
    id: "summary",
    label: "Client-ready summary",
    hint: "Plain-English overview a non-lawyer can act on.",
    icon: Mail,
  },
];

type Props = {
  documentId: string | null;
  contractText: string;
  documentName?: string | null;
  onGoToContracts?: () => void;
};

export default function AgentPage({
  documentId,
  contractText,
  documentName,
  onGoToContracts,
}: Props) {
  const hasContract = !!(documentId || contractText);

  const [agentGoal, setAgentGoal] = React.useState<AgentGoal | null>(null);
  const [agentLoading, setAgentLoading] = React.useState(false);
  const [agentError, setAgentError] = React.useState("");
  const [agentResult, setAgentResult] = React.useState<AgentResult | null>(null);

  const [contractQA, setContractQA] = React.useState<{ question: string; answer: string } | null>(
    null,
  );
  const [contractQALoading, setContractQALoading] = React.useState(false);

  const [globalQA, setGlobalQA] = React.useState<{ question: string; answer: string } | null>(null);
  const [globalQALoading, setGlobalQALoading] = React.useState(false);

  React.useEffect(() => {
    setAgentResult(null);
    setAgentError("");
    setAgentGoal(null);
    setContractQA(null);
  }, [documentId]);

  async function runAgent() {
    if (!agentGoal) {
      setAgentError("Please pick what the agent should do.");
      return;
    }
    if (!hasContract) {
      setAgentError("Please upload a contract first (Contracts tab).");
      return;
    }
    setAgentError("");
    setAgentResult(null);
    setAgentLoading(true);
    try {
      const res = await fetch("/api/agent-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: documentId || undefined,
          contractText: !documentId ? contractText : undefined,
          selectedGoal: agentGoal,
        }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error || `Agent failed (status ${res.status})`);
      setAgentResult(data as AgentResult);
    } catch (err: any) {
      setAgentError(err?.message || "Agent review failed");
    } finally {
      setAgentLoading(false);
    }
  }

  async function askContract(question: string) {
    if (!question.trim()) return;
    if (!documentId) {
      setContractQA({ question, answer: "Please upload a contract first." });
      return;
    }
    setContractQALoading(true);
    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: documentId, question }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error || `Q&A failed (status ${res.status})`);
      setContractQA({ question, answer: data.answer || "(No answer returned)" });
    } catch (err: any) {
      setContractQA({ question, answer: err?.message || "Error during Q&A" });
    } finally {
      setContractQALoading(false);
    }
  }

  async function askGlobal(question: string) {
    if (!question.trim()) return;
    setGlobalQALoading(true);
    try {
      const res = await fetch("/api/legalqa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error || `Legal Q&A failed (status ${res.status})`);
      setGlobalQA({ question, answer: data.answer || "(No answer returned)" });
    } catch (err: any) {
      setGlobalQA({ question, answer: err?.message || "Error during Legal Q&A" });
    } finally {
      setGlobalQALoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="AI Agent"
        title="Contract Review Agent"
        description="A junior associate at scale. Pick a goal and the agent will work through this contract, flag risk, and draft language. Output is for attorney review and is not legal advice."
      />

      {/* Active contract banner */}
      {hasContract ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-100">
              <FileText className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                Reviewing
              </p>
              <p className="truncate text-sm font-medium text-slate-900">
                {documentName || "Pasted contract text"}
              </p>
            </div>
          </div>
          {onGoToContracts && (
            <Button variant="ghost" size="xs" onClick={onGoToContracts}>
              Change
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>No active contract.</span>
          </div>
          {onGoToContracts && (
            <Button variant="secondary" size="xs" onClick={onGoToContracts}>
              Go to Contracts <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      {/* Goal grid */}
      <div>
        <SectionHeader
          eyebrow="Step 1"
          title="What should the agent do?"
          description="Pick the goal that matches your work. The agent tailors its review to that outcome."
          className="mb-4"
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          {AGENT_GOALS.map((g) => {
            const active = agentGoal === g.id;
            const Icon = g.icon;
            return (
              <button
                key={g.id}
                onClick={() => setAgentGoal(g.id)}
                aria-pressed={active}
                className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white shadow-[0_8px_24px_-8px_rgba(15,23,42,0.25)]"
                    : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-[0_8px_24px_-8px_rgba(15,23,42,0.1)] hover:-translate-y-0.5"
                }`}
              >
                <div
                  className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg transition ${
                    active
                      ? "bg-white/10 ring-1 ring-white/15 text-amber-200"
                      : "bg-slate-50 ring-1 ring-slate-200/80 text-slate-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p
                  className={`text-sm font-semibold tracking-tight ${
                    active ? "text-white" : "text-slate-900"
                  }`}
                >
                  {g.label}
                </p>
                <p
                  className={`mt-1 text-xs leading-relaxed ${
                    active ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {g.hint}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Run + result */}
      <Card padded={false}>
        <div className="flex items-center justify-between gap-4 border-b border-slate-200/60 px-6 py-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
              Step 2
            </p>
            <p className="text-sm font-semibold tracking-tight text-slate-900">Run review</p>
          </div>
          <Button
            variant="accent"
            size="md"
            onClick={runAgent}
            disabled={agentLoading || !agentGoal || !hasContract}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {agentLoading ? "Agent working…" : "Run Agent"}
          </Button>
        </div>

        <div className="px-6 py-5">
          {agentError && (
            <div className="rounded-xl border border-red-200 bg-red-50/70 px-4 py-3 text-sm text-red-700">
              {agentError}
            </div>
          )}

          {!agentError && !agentResult && !agentLoading && (
            <p className="text-xs text-slate-500">
              {agentGoal
                ? "Ready when you are. Click Run Agent."
                : "Select a goal above to get started."}
            </p>
          )}

          {agentLoading && !agentResult && (
            <div className="space-y-3" role="status" aria-live="polite">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
                Reading the contract and drafting your review…
              </div>
              <div className="space-y-3 animate-pulse">
                <div className="h-20 rounded-xl bg-slate-100" />
                <div className="h-32 rounded-xl bg-slate-100" />
                <div className="h-24 rounded-xl bg-slate-100" />
              </div>
            </div>
          )}

          {agentResult && (
            <div className="space-y-5">
              {/* Agent Summary */}
              <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <h4 className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
                    Agent summary
                  </h4>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                  {agentResult.agentSummary || "(No summary returned.)"}
                </p>
              </div>

              {/* Key Risks */}
              <Card padded={false}>
                <CardHeader
                  className="border-b border-slate-200/60 px-5 py-3.5"
                  title={
                    <span className="flex items-center gap-2">
                      <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                      Key risks
                    </span>
                  }
                  description={`${agentResult.keyRisks.length} identified`}
                />
                <div className="px-5 py-4">
                  {agentResult.keyRisks.length === 0 ? (
                    <p className="text-xs text-slate-500">No risks identified.</p>
                  ) : (
                    <ul className="space-y-3">
                      {agentResult.keyRisks.map((r, i) => (
                        <li
                          key={i}
                          className="rounded-lg border border-slate-200/70 bg-white p-3.5"
                        >
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                r.severity === "High"
                                  ? "red"
                                  : r.severity === "Medium"
                                  ? "amber"
                                  : "green"
                              }
                              dot
                            >
                              {r.severity}
                            </Badge>
                            <span className="text-sm font-medium text-slate-900">
                              {r.title}
                            </span>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">
                            {r.explanation}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>

              {/* Missing Clauses */}
              <Card padded={false}>
                <CardHeader
                  className="border-b border-slate-200/60 px-5 py-3.5"
                  title={
                    <span className="flex items-center gap-2">
                      <ListChecks className="h-3.5 w-3.5 text-slate-500" />
                      Missing or weak clauses
                    </span>
                  }
                  description={`${agentResult.missingClauses.length} flagged`}
                />
                <div className="px-5 py-4">
                  {agentResult.missingClauses.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No missing or weak clauses identified.
                    </p>
                  ) : (
                    <ul className="space-y-2.5">
                      {agentResult.missingClauses.map((c, i) => (
                        <li
                          key={i}
                          className="rounded-lg border border-slate-200/70 bg-white p-3.5"
                        >
                          <p className="text-sm font-medium text-slate-900">{c.title}</p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">
                            {c.explanation}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>

              {/* Negotiation Points */}
              <Card padded={false}>
                <CardHeader
                  className="border-b border-slate-200/60 px-5 py-3.5"
                  title={
                    <span className="flex items-center gap-2">
                      <Handshake className="h-3.5 w-3.5 text-slate-500" />
                      Negotiation points
                    </span>
                  }
                />
                <div className="px-5 py-4">
                  {agentResult.negotiationPoints.length === 0 ? (
                    <p className="text-xs text-slate-500">No negotiation points provided.</p>
                  ) : (
                    <ul className="space-y-2 text-sm text-slate-700">
                      {agentResult.negotiationPoints.map((p, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                          <span className="leading-relaxed">{p}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>

              {/* Suggested Edits */}
              <Card padded={false}>
                <CardHeader
                  className="border-b border-slate-200/60 px-5 py-3.5"
                  title={
                    <span className="flex items-center gap-2">
                      <PenLine className="h-3.5 w-3.5 text-slate-500" />
                      Suggested edits
                    </span>
                  }
                />
                <div className="px-5 py-4">
                  {agentResult.suggestedEdits.length === 0 ? (
                    <p className="text-xs text-slate-500">No edits suggested.</p>
                  ) : (
                    <ul className="space-y-3">
                      {agentResult.suggestedEdits.map((s, i) => (
                        <li
                          key={i}
                          className="overflow-hidden rounded-lg border border-slate-200/70 bg-white"
                        >
                          <div className="border-b border-slate-200/60 bg-slate-50/60 px-4 py-2">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                              Issue
                            </p>
                            <p className="mt-0.5 text-sm text-slate-800 whitespace-pre-wrap">
                              {s.originalIssue}
                            </p>
                          </div>
                          <div className="px-4 py-3">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-amber-700">
                              Suggested language
                            </p>
                            <p className="mt-0.5 text-sm text-slate-800 whitespace-pre-wrap">
                              {s.suggestedLanguage}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>

              {/* Email Draft */}
              <Card padded={false}>
                <CardHeader
                  className="border-b border-slate-200/60 px-5 py-3.5"
                  title={
                    <span className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                      Client-ready email draft
                    </span>
                  }
                  action={
                    agentResult.clientEmailDraft && (
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() =>
                          navigator.clipboard.writeText(agentResult.clientEmailDraft)
                        }
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </Button>
                    )
                  }
                />
                <div className="px-5 py-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">
                    {agentResult.clientEmailDraft || "(No email draft returned.)"}
                  </pre>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>

      {/* Q&A row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Ask this contract */}
        <Card padded={false}>
          <CardHeader
            className="border-b border-slate-200/60 px-6 py-4"
            title={
              <span className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                Ask this contract
              </span>
            }
            description="Anchored to the active contract."
          />
          <div className="px-6 py-5 space-y-4">
            <input
              type="text"
              placeholder="e.g., What are the termination penalties?"
              disabled={!hasContract}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = (e.currentTarget as HTMLInputElement).value;
                  askContract(value);
                  (e.currentTarget as HTMLInputElement).value = "";
                }
              }}
            />
            {contractQALoading && <p className="text-xs text-slate-500">Thinking…</p>}
            {contractQA && !contractQALoading && (
              <div className="rounded-lg border border-slate-200/70 bg-white p-4">
                <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                  Question
                </p>
                <p className="mt-0.5 text-sm text-slate-800">{contractQA.question}</p>
                <p className="mt-3 text-[10px] font-medium uppercase tracking-widest text-slate-500">
                  Answer
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-800">
                  {contractQA.answer}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Firmwide Q&A */}
        <Card padded={false}>
          <CardHeader
            className="border-b border-slate-200/60 px-6 py-4"
            title={
              <span className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-slate-500" />
                Firmwide legal Q&A
              </span>
            }
            description="General legal questions, no document required."
          />
          <div className="px-6 py-5 space-y-4">
            <input
              type="text"
              placeholder="e.g., What is a reasonable limitation of liability?"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = (e.currentTarget as HTMLInputElement).value;
                  askGlobal(value);
                  (e.currentTarget as HTMLInputElement).value = "";
                }
              }}
            />
            {globalQALoading && <p className="text-xs text-slate-500">Thinking…</p>}
            {globalQA && !globalQALoading && (
              <div className="rounded-lg border border-slate-200/70 bg-white p-4">
                <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                  Question
                </p>
                <p className="mt-0.5 text-sm text-slate-800">{globalQA.question}</p>
                <p className="mt-3 text-[10px] font-medium uppercase tracking-widest text-slate-500">
                  Answer
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-800">
                  {globalQA.answer}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
