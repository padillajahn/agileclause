"use client";

import React from "react";
import {
  FileText,
  Search,
  ShieldCheck,
  Users,
  Settings,
  BarChart,
  Upload,
  Sparkles,
  Play,
  RefreshCw,
  MessageSquare,
  Eye,
  Trash2,
} from "lucide-react";

export default function AgileClauseUI() {
  // ===== Types =====
  type Insights = { risks: string[]; keyClauses: string[]; summary: string };
  type WorkspaceDoc = {
    id: string;
    name: string;
    date: string;
    status: "Pending" | "Analyzed";
    fullText: string;
    insights: Insights | null;
  };
  type TemplateItem = { id: string; name: string; updated_at: string };
  type TeamMember = { id: string; name: string; role: string; created_at?: string };
  type ComplianceMetrics = { riskyClausesFlagged: number; contractsReviewed: number; policyCompliance: number };
  type AdminStats = { monthlyActiveUsers: number; documentsAnalyzed: number; documentsUploaded: number; avgResponseSec: number };
  type SettingsModel = {
    productName: string;
    primaryColor: string;
    policy: { governingLaw: string; liabilityCap: string; arbitration: "Required" | "Optional" | "Not allowed" };
  };

  // ===== State =====
  const [active, setActive] = React.useState<
    "Contracts" | "Legal Q&A" | "Compliance" | "Templates" | "Team" | "Settings" | "Admin"
  >("Contracts");

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [documentId, setDocumentId] = React.useState<string | null>(null);
  const [contractText, setContractText] = React.useState<string>("");
  const [aiInsights, setAiInsights] = React.useState<Insights | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errorMsg, setErrorMsg] = React.useState<string>("");
  const [warningMsg, setWarningMsg] = React.useState<string>("");
  const [diagnostics, setDiagnostics] = React.useState<null | Record<string, unknown>>(null);

  // Q&A separation
  const [contractQA, setContractQA] = React.useState<null | { question: string; answer: string }>(null);
  const [globalQA, setGlobalQA] = React.useState<null | { question: string; answer: string }>(null);

  // Project Workspace (session-only)
  const [workspace, setWorkspace] = React.useState<WorkspaceDoc[]>([]);

  // Other tabs data
  const [templateList, setTemplateList] = React.useState<TemplateItem[]>([]);
  const [team, setTeam] = React.useState<TeamMember[]>([]);
  const [settings, setSettings] = React.useState<SettingsModel | null>(null);
  const [compliance, setCompliance] = React.useState<ComplianceMetrics | null>(null);
  const [adminStats, setAdminStats] = React.useState<AdminStats | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // ===== Demo stub data (leave as-is) =====
  const defaultSettings: SettingsModel = {
    productName: "AgileClause",
    primaryColor: "#2563eb",
    policy: { governingLaw: "Delaware", liabilityCap: "1x fees", arbitration: "Required" },
  };

  // ===== Tab data fetch =====
  React.useEffect(() => {
    (async () => {
      try {
        if (active === "Templates") {
          const r = await fetch("/api/templates");
          const j = await r.json();
          if (r.ok) setTemplateList(j.templates || []);
        } else if (active === "Team") {
          const r = await fetch("/api/team");
          const j = await r.json();
          if (r.ok) setTeam(j.members || []);
        } else if (active === "Settings") {
          const r = await fetch("/api/settings");
          const j = await r.json();
          if (r.ok) setSettings(j.settings || defaultSettings);
        } else if (active === "Compliance") {
          const r = await fetch("/api/compliance");
          const j = await r.json();
          if (r.ok) setCompliance(j.metrics || null);
        } else if (active === "Admin") {
          const r = await fetch("/api/admin");
          const j = await r.json();
          if (r.ok) setAdminStats(j.stats || null);
        }
      } catch {
        // swallow for now
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // ===== Upload & Analyze =====
  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    setSelectedFile(file);
    setLoading(true);
    setErrorMsg("");
    setWarningMsg("");
    setAiInsights(null);
    setContractText("");
    setContractQA(null);

    try {
      // 1) Upload
      const formData = new FormData();
      formData.append("file", file);
      const upRes = await fetch("/api/upload", { method: "POST", body: formData });
      const up = await upRes.json().catch(() => ({} as any));
      if (!upRes.ok || !up?.document_id) {
        throw new Error(up?.error || `Upload failed (status ${upRes.status})`);
      }

      const newDoc: WorkspaceDoc = {
        id: String(up.document_id),
        name: file.name,
        date: new Date().toLocaleString(),
        status: "Pending",
        fullText: "",
        insights: null,
      };
      setWorkspace((prev) => {
        const next = [...prev, newDoc];
        return next.slice(-5);
      });

      setDocumentId(up.document_id as string);

      // 2) Analyze
      const anRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: up.document_id }),
      });
      const an = await anRes.json().catch(() => ({} as any));
      if (!anRes.ok) throw new Error(an?.error || `Analyze failed (status ${anRes.status})`);

      // 3) Update UI
      const full = an.fullText || an.plainTextSnippet || "(No text extracted — try a different file.)";
      const insights: Insights = {
        risks: an.risks || [],
        keyClauses: an.keyClauses || [],
        summary: an.summary || "",
      };
      setContractText(full);
      setAiInsights(insights);

      // 4) Mark doc as Analyzed in workspace and store insights + full text
      setWorkspace((prev) =>
        prev.map((d) => (d.id === newDoc.id ? { ...d, status: "Analyzed", fullText: full, insights } : d))
      );
    } catch (err: any) {
      setErrorMsg(err?.message || "Error during upload/analyze");
    } finally {
      setLoading(false);
    }
  }

  // ===== Contract Q&A =====
  async function askContractQuestion(question: string) {
    if (!question) return;
    if (!documentId) {
      setErrorMsg("Please upload and analyze a contract first.");
      return;
    }
    try {
      const qaRes = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: documentId, question }),
      });
      const qaJson = await qaRes.json().catch(() => ({} as any));
      if (!qaRes.ok) throw new Error(qaJson?.error || `QA failed (status ${qaRes.status})`);
      setContractQA({ question, answer: qaJson.answer || "(No answer returned)" });
    } catch (err: any) {
      setErrorMsg(err?.message || "Error during Q&A");
    }
  }

  // ===== Legal (global) Q&A =====
  async function askGlobalQuestion(question: string) {
    if (!question) return;
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
    }
  }

  // ===== Diagnostics =====
  async function runApiDiagnostics() {
    const results: Record<string, unknown> = {};
    try {
      const pingAnalyzePost = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: "diag" }),
      });
      results.analyzePOST = pingAnalyzePost.status;
    } catch {
      results.analyzePOST = "network-error";
    }
    try {
      const pingAnalyzeGet = await fetch("/api/analyze?document_id=diag");
      results.analyzeGET = pingAnalyzeGet.status;
    } catch {
      results.analyzeGET = "network-error";
    }
    try {
      const pingQAPOST = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: "diag", question: "diag" }),
      });
      results.qaPOST = pingQAPOST.status;
    } catch {
      results.qaPOST = "network-error";
    }
    try {
      const pingQAGET = await fetch("/api/qa?document_id=diag&question=diag");
      results.qaGET = pingQAGET.status;
    } catch {
      results.qaGET = "network-error";
    }
    setDiagnostics(results);
  }

  // ===== UI helpers =====
  const NavBtn: React.FC<{ label: typeof active; icon: React.ComponentType<any> }> = ({ label, icon: Icon }) => (
    <button
      onClick={() => setActive(label)}
      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
        active === label ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
      }`}
      aria-pressed={active === label}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  function openAnalysis(doc: WorkspaceDoc) {
    if (doc.status === "Analyzed" && doc.insights) {
      setContractText(doc.fullText || "");
      setAiInsights(doc.insights);
      setDocumentId(doc.id);
      setContractQA(null);
      setActive("Contracts");
    }
  }

  function removeFromWorkspace(id: string) {
    setWorkspace((prev) => prev.filter((d) => d.id !== id));
  }

  const recentDocs = workspace.slice(-5).reverse(); // newest first

  // ===== Render =====
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 border-r border-slate-200 bg-white/70 backdrop-blur-md">
        <div className="px-6 py-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span className="text-xl font-semibold tracking-tight">AgileClause</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">AI for contracts & compliance</p>
        </div>
        <nav className="p-3 space-y-1">
          <NavBtn icon={FileText} label="Contracts" />
          <NavBtn icon={Search} label="Legal Q&A" />
          <NavBtn icon={ShieldCheck} label="Compliance" />
          <NavBtn icon={FileText} label="Templates" />
          <NavBtn icon={Users} label="Team" />
          <NavBtn icon={Settings} label="Settings" />
          <NavBtn icon={BarChart} label="Admin" />
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <button
            onClick={runApiDiagnostics}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" /> Run Diagnostics
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-72">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
            <h1 className="text-lg font-semibold">{active}</h1>
            <div className="flex items-center gap-2">
              {active === "Contracts" && (
                <button
                  onClick={handleUploadClick}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 shadow-sm"
                >
                  <Upload className="h-4 w-4" /> New Document
                </button>
              )}
              <button className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-slate-700 hover:bg-slate-50">
                <Play className="h-4 w-4" /> Quick Demo
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-6 space-y-6">
          {errorMsg && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700">{errorMsg}</div>}
          {!errorMsg && warningMsg && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">{warningMsg}</div>
          )}

          {/* Contracts */}
          {active === "Contracts" && (
            <>
              {/* Upload */}
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-base font-semibold">Upload Contracts</h2>
                    <p className="text-sm text-slate-500">PDF, DOCX, or TXT — we’ll scan and flag risks automatically.</p>
                    {selectedFile && <p className="text-xs text-slate-500 mt-1">Selected: {selectedFile.name}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      onClick={handleUploadClick}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 shadow-sm"
                    >
                      <Upload className="h-4 w-4" /> Upload
                    </button>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-dashed bg-slate-50/60 p-6 text-center text-sm text-slate-600">
                  Drag & drop your file here, or use the Upload button.
                </div>
              </section>

              {/* Project Workspace (session) */}
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Project Workspace</h3>
                  <p className="text-xs text-slate-500">Session-only for now — persistence is via Supabase APIs.</p>
                </div>
                {recentDocs.length === 0 ? (
                  <p className="text-sm text-slate-500">No documents yet. Upload to get started.</p>
                ) : (
                  <ul className="space-y-2">
                    {recentDocs.map((doc) => (
                      <li key={doc.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 rounded-lg border p-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate" title={doc.name}>📄 {doc.name}</p>
                          <p className="text-xs text-slate-500">⏱ {doc.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              doc.status === "Analyzed"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-amber-100 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {doc.status}
                          </span>
                          <button
                            className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
                            onClick={() => openAnalysis(doc)}
                            disabled={doc.status !== "Analyzed"}
                            title={doc.status === "Analyzed" ? "Open Analysis" : "Analyzing…"}
                          >
                            <Eye className="h-4 w-4" />
                            View Analysis
                          </button>
                          <button
                            className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-sm hover:bg-slate-50"
                            onClick={() => removeFromWorkspace(doc.id)}
                            title="Remove from list"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Content grid */}
              <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-2xl border bg-white p-6 shadow-sm">
                  <h3 className="font-semibold">Contract Text</h3>
                  <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 min-h-[260px] max-h-[65vh] overflow-auto whitespace-pre-wrap">
                    {contractText || (loading ? "Analyzing..." : "Upload a contract to begin analysis.")}
                  </div>
                </div>
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                  <h3 className="font-semibold">AI Insights</h3>
                  {!aiInsights && !loading && (
                    <p className="mt-2 text-sm text-slate-500">Upload a document to see flagged risks, key clauses, and a summary.</p>
                  )}
                  {aiInsights && (
                    <div className="mt-3 space-y-4 text-sm text-slate-800">
                      <div>
                        <p className="font-medium">Flagged Risks</p>
                        <ul className="mt-1 list-disc list-inside">{aiInsights.risks.map((r, i) => <li key={i}>{r}</li>)}</ul>
                      </div>
                      <div>
                        <p className="font-medium">Key Clauses</p>
                        <ul className="mt-1 list-disc list-inside">{aiInsights.keyClauses.map((k, i) => <li key={i}>{k}</li>)}</ul>
                      </div>
                      <div>
                        <p className="font-medium">Summary</p>
                        <p className="mt-1 leading-relaxed">{aiInsights.summary}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Contract Q&A */}
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold">Ask This Contract</h3>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., What are the termination penalties?"
                    className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const value = (e.currentTarget as HTMLInputElement).value;
                        askContractQuestion(value);
                        (e.currentTarget as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  <button
                    onClick={() => askContractQuestion("What are the termination risks?")}
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    Ask
                  </button>
                </div>
                {contractQA && (
                  <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-sm">
                    <p className="font-medium">Q:</p>
                    <p className="text-slate-800">{contractQA.question}</p>
                    <p className="font-medium mt-2">A:</p>
                    <p className="text-slate-800 whitespace-pre-wrap">{contractQA.answer}</p>
                  </div>
                )}
              </section>
            </>
          )}

          {/* Legal Q&A */}
          {active === "Legal Q&A" && (
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="font-semibold mb-2">Firmwide Legal Q&A</h3>
                <p className="text-sm text-slate-500 mb-4">Ask general legal questions (not tied to a single document).</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., What is a reasonable limitation of liability?"
                    className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const value = (e.currentTarget as HTMLInputElement).value;
                        askGlobalQuestion(value);
                        (e.currentTarget as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  <button
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                    onClick={() => askGlobalQuestion("What’s a reasonable liability cap?")}
                  >
                    Ask
                  </button>
                </div>
                {globalQA && (
                  <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm">
                    <p className="font-medium">Q:</p>
                    <p className="text-slate-800">{globalQA.question}</p>
                    <p className="font-medium mt-2">A:</p>
                    <p className="text-slate-800 whitespace-pre-wrap">{globalQA.answer}</p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="font-semibold mb-2">Pinned Topics</h3>
                <ul className="text-sm list-disc list-inside space-y-1 text-slate-700">
                  <li>Indemnification best practices</li>
                  <li>Governing law & venue choices</li>
                  <li>Data protection addendum basics</li>
                </ul>
              </div>
            </section>
          )}

          {/* Templates */}
          {active === "Templates" && (
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Templates</h3>
                <button
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                  onClick={async () => {
                    const name = prompt("Template name?");
                    if (!name) return;
                    const r = await fetch("/api/templates", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name, body: "" }),
                    });
                    const j = await r.json();
                    if (r.ok && j.template) setTemplateList([j.template, ...templateList]);
                    else alert(j.error || "Create failed");
                  }}
                >
                  New Template
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templateList.map((t) => (
                  <div key={t.id} className="rounded-xl border p-4 hover:shadow-sm">
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-slate-500">Updated {new Date(t.updated_at).toLocaleString()}</p>
                    <div className="mt-3 flex gap-2">
                      <button className="rounded-lg border px-2 py-1 text-sm" onClick={() => alert("Open editor coming soon")}>
                        Open
                      </button>
                      <button className="rounded-lg border px-2 py-1 text-sm" onClick={() => alert("Duplicate coming soon")}>
                        Duplicate
                      </button>
                    </div>
                  </div>
                ))}
                {templateList.length === 0 && <p className="text-sm text-slate-500">No templates yet.</p>}
              </div>
            </section>
          )}

          {/* Team */}
          {active === "Team" && (
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Team</h3>
                <button
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                  onClick={async () => {
                    const name = prompt("Member name?");
                    const role = name ? prompt("Role (e.g., General Counsel, Associate, Paralegal)?") : null;
                    if (!name || !role) return;
                    const r = await fetch("/api/team", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name, role }),
                    });
                    const j = await r.json();
                    if (r.ok && j.member) setTeam([...team, j.member]);
                    else alert(j.error || "Invite failed");
                  }}
                >
                  Invite Member
                </button>
              </div>
              <div className="divide-y">
                {team.map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-lg border px-2 py-1 text-sm" onClick={() => alert("Role edit coming soon")}>
                        Make Admin
                      </button>
                      <button className="rounded-lg border px-2 py-1 text-sm" onClick={() => alert("Remove coming soon")}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {team.length === 0 && <p className="text-sm text-slate-500 py-3">No team members yet.</p>}
              </div>
            </section>
          )}

          {/* Compliance */}
          {active === "Compliance" && (
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="font-semibold mb-2">Compliance Dashboard</h3>
              <p className="text-sm text-slate-600">Track clause coverage, risky terms frequency, and policy alignment.</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="rounded-xl border p-4">
                  <p className="text-slate-500">Risky clauses flagged</p>
                  <p className="text-2xl font-semibold">{compliance?.riskyClausesFlagged ?? 0}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-slate-500">Contracts reviewed</p>
                  <p className="text-2xl font-semibold">{compliance?.contractsReviewed ?? 0}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-slate-500">Policy compliance</p>
                  <p className="text-2xl font-semibold">{(compliance?.policyCompliance ?? 0) + "%"}</p>
                </div>
              </div>
            </section>
          )}

          {/* Settings */}
          {active === "Settings" && (
            <section className="rounded-2xl border bg-white p-6 shadow-sm text-sm">
              <h3 className="font-semibold mb-4">Workspace Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Brand */}
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Brand</p>
                  <div>
                    <label className="block text-slate-700 mb-1">Product name</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2"
                      value={settings?.productName ?? defaultSettings.productName}
                      onChange={(e) => setSettings((s) => ({ ...(s || defaultSettings), productName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Primary color</label>
                    <input
                      type="color"
                      className="h-10 w-16 rounded border"
                      value={settings?.primaryColor ?? defaultSettings.primaryColor}
                      onChange={(e) => setSettings((s) => ({ ...(s || defaultSettings), primaryColor: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="darkmode" type="checkbox" className="h-4 w-4" disabled />
                    <label htmlFor="darkmode">Enable dark mode (coming soon)</label>
                  </div>
                </div>

                {/* Policy */}
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Policy</p>
                  <div>
                    <label className="block text-slate-700 mb-1">Preferred governing law</label>
                    <select
                      className="w-full rounded-xl border px-3 py-2"
                      value={settings?.policy?.governingLaw ?? defaultSettings.policy.governingLaw}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...(s || defaultSettings),
                          policy: { ...(s?.policy || defaultSettings.policy), governingLaw: e.target.value },
                        }))
                      }
                    >
                      <option>Delaware</option>
                      <option>New York</option>
                      <option>California</option>
                      <option>England & Wales</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Default liability cap</label>
                    <select
                      className="w-full rounded-xl border px-3 py-2"
                      value={settings?.policy?.liabilityCap ?? defaultSettings.policy.liabilityCap}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...(s || defaultSettings),
                          policy: { ...(s?.policy || defaultSettings.policy), liabilityCap: e.target.value },
                        }))
                      }
                    >
                      <option>1x fees</option>
                      <option>2x fees</option>
                      <option>Direct damages only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Arbitration</label>
                    <select
                      className="w-full rounded-xl border px-3 py-2"
                      value={settings?.policy?.arbitration ?? defaultSettings.policy.arbitration}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...(s || defaultSettings),
                          policy: { ...(s?.policy || defaultSettings.policy), arbitration: e.target.value as any },
                        }))
                      }
                    >
                      <option>Required</option>
                      <option>Optional</option>
                      <option>Not allowed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <button
                  className="rounded-xl bg-slate-900 text-white px-3 py-2"
                  onClick={async () => {
                    try {
                      const r = await fetch("/api/settings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(settings || defaultSettings),
                      });
                      if (!r.ok) alert("Save failed");
                    } catch {
                      alert("Save failed");
                    }
                  }}
                >
                  Save changes
                </button>
                <button className="rounded-xl border px-3 py-2" onClick={() => setSettings(defaultSettings)}>
                  Reset
                </button>
              </div>
            </section>
          )}

          {/* Admin */}
          {active === "Admin" && (
            <section className="rounded-2xl border bg-white p-6 shadow-sm text-sm">
              <h3 className="font-semibold mb-4">Admin</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border p-4">
                  <p className="text-slate-500">Monthly active users</p>
                  <p className="text-2xl font-semibold">{adminStats?.monthlyActiveUsers ?? 0}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-slate-500">Documents analyzed</p>
                  <p className="text-2xl font-semibold">{adminStats?.documentsAnalyzed ?? 0}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-slate-500">Avg. response time</p>
                  <p className="text-2xl font-semibold">{(adminStats?.avgResponseSec ?? 1.2) + "s"}</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-2">Access Control</h4>
                <table className="w-full text-left border rounded-xl overflow-hidden">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-2">Role</th>
                      <th className="p-2">Permissions</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-2">Admin</td>
                      <td className="p-2">Full access</td>
                      <td className="p-2">
                        <button className="rounded-lg border px-2 py-1" onClick={() => alert("Edit coming soon")}>
                          Edit
                        </button>
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2">Reviewer</td>
                      <td className="p-2">View + Comment</td>
                      <td className="p-2">
                        <button className="rounded-lg border px-2 py-1" onClick={() => alert("Edit coming soon")}>
                          Edit
                        </button>
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2">Contributor</td>
                      <td className="p-2">Upload + Analyze</td>
                      <td className="p-2">
                        <button className="rounded-lg border px-2 py-1" onClick={() => alert("Edit coming soon")}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {diagnostics && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">API Diagnostics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-lg border p-2">/api/analyze POST → <strong>{String(diagnostics.analyzePOST)}</strong></div>
                    <div className="rounded-lg border p-2">/api/analyze GET → <strong>{String(diagnostics.analyzeGET)}</strong></div>
                    <div className="rounded-lg border p-2">/api/qa POST → <strong>{String(diagnostics.qaPOST)}</strong></div>
                    <div className="rounded-lg border p-2">/api/qa GET → <strong>{String(diagnostics.qaGET)}</strong></div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Diagnostics (visible if set by button) */}
          {diagnostics && active !== "Admin" && (
            <section className="rounded-2xl border bg-white p-6 shadow-sm text-sm">
              <h3 className="font-semibold mb-2">API Diagnostics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-lg border p-2">/api/analyze POST → <strong>{String(diagnostics.analyzePOST)}</strong></div>
                <div className="rounded-lg border p-2">/api/analyze GET → <strong>{String(diagnostics.analyzeGET)}</strong></div>
                <div className="rounded-lg border p-2">/api/qa POST → <strong>{String(diagnostics.qaPOST)}</strong></div>
                <div className="rounded-lg border p-2">/api/qa GET → <strong>{String(diagnostics.qaGET)}</strong></div>
              </div>
              <p className="mt-2 text-slate-500">Tip: If you see 405, ensure the route exports a matching handler (e.g., <code>export async function POST()</code>).</p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
