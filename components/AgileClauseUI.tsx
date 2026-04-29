"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { Search, Upload } from "lucide-react";
import Sidebar, { SidebarTab } from "./Sidebar";
import { Button } from "./ui/Button";
import ContractsPage from "./pages/ContractsPage";
import AgentPage from "./pages/AgentPage";
import PlaybooksPage from "./pages/PlaybooksPage";
import KnowledgePage from "./pages/KnowledgePage";
import TeamPage from "./pages/TeamPage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";
import {
  type Insights,
  type WorkspaceDoc,
  inferContractType,
  inferRiskLevel,
} from "./pages/types";

export default function AgileClauseUI() {
  const { profile, signOut } = useAuth();
  const isAdmin = profile?.role === "admin";

  // ===== Navigation =====
  const [active, setActive] = React.useState<SidebarTab>("Contracts");

  // ===== Shared contract state =====
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [documentId, setDocumentId] = React.useState<string | null>(null);
  const [contractText, setContractText] = React.useState<string>("");
  const [aiInsights, setAiInsights] = React.useState<Insights | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errorMsg, setErrorMsg] = React.useState<string>("");
  const [warningMsg, setWarningMsg] = React.useState<string>("");
  const [workspace, setWorkspace] = React.useState<WorkspaceDoc[]>([]);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const UPLOAD_INPUT_ID = "agileclause-file-input";

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0] && active !== "Contracts") setActive("Contracts");
    const file = e.target.files?.[0] || null;
    if (!file) return;

    setSelectedFile(file);
    setLoading(true);
    setErrorMsg("");
    setWarningMsg("");
    setAiInsights(null);
    setContractText("");

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
        type: inferContractType(file.name),
        riskLevel: undefined,
        uploadedAt: Date.now(),
      };
      setWorkspace((prev) => [...prev, newDoc].slice(-50));
      setDocumentId(up.document_id as string);

      // 2) Analyze
      const anRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: up.document_id }),
      });
      const an = await anRes.json().catch(() => ({} as any));
      if (!anRes.ok) {
        setWarningMsg(an?.error || `Analyze failed (status ${anRes.status})`);
        return;
      }

      const full =
        an.fullText || an.plainTextSnippet || "(No text extracted — try a different file.)";
      const insights: Insights = {
        risks: an.risks || [],
        keyClauses: an.keyClauses || [],
        summary: an.summary || "",
      };
      setContractText(full);
      setAiInsights(insights);

      const riskLevel = inferRiskLevel(insights);
      setWorkspace((prev) =>
        prev.map((d) =>
          d.id === newDoc.id
            ? { ...d, status: "Analyzed", fullText: full, insights, riskLevel }
            : d,
        ),
      );
    } catch (err: any) {
      setErrorMsg(err?.message || "Error during upload/analyze");
    } finally {
      setLoading(false);
      if (e.target) e.target.value = "";
    }
  }

  function openAnalysis(doc: WorkspaceDoc) {
    setContractText(doc.fullText || "");
    setAiInsights(doc.insights);
    setDocumentId(doc.id);
    setActive("Contracts");
  }

  function removeFromWorkspace(id: string) {
    setWorkspace((prev) => prev.filter((d) => d.id !== id));
    if (documentId === id) {
      setDocumentId(null);
      setContractText("");
      setAiInsights(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900">
      <Sidebar
        active={active}
        onChange={setActive}
        profile={profile ? { ...profile, full_name: profile.full_name ?? null } : null}
        onSignOut={signOut}
        isAdmin={isAdmin}
      />

      {/* Single hidden file input — triggered via <label htmlFor> from any button */}
      <input
        id={UPLOAD_INPUT_ID}
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="sr-only"
        onChange={handleFileChange}
      />

      <main className="ml-72 relative z-10">
        {/* Top bar */}
        <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-8 py-3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">{profile?.full_name || "Workspace"}</span>
              <span className="text-slate-300">/</span>
              <span className="font-medium text-slate-900">{active}</span>
            </div>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contracts, clauses, knowledge…"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-14 text-xs text-slate-700 placeholder:text-slate-400 transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Action */}
            <label
              htmlFor={UPLOAD_INPUT_ID}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-900 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition hover:bg-slate-800"
            >
              <Upload className="h-3.5 w-3.5" /> Upload contract
            </label>
          </div>
        </header>

        {/* Page content */}
        <div className="mx-auto max-w-7xl px-8 py-10">
          {active === "Contracts" && (
            <ContractsPage
              selectedFile={selectedFile}
              loading={loading}
              errorMsg={errorMsg}
              warningMsg={warningMsg}
              documentId={documentId}
              contractText={contractText}
              aiInsights={aiInsights}
              workspace={workspace}
              uploadInputId={UPLOAD_INPUT_ID}
              fileInputRef={fileInputRef}
              onFileChange={handleFileChange}
              onOpenAnalysis={openAnalysis}
              onRemoveFromWorkspace={removeFromWorkspace}
              onGoToAgent={() => setActive("Agent")}
            />
          )}

          {active === "Agent" && (
            <AgentPage
              documentId={documentId}
              contractText={contractText}
              documentName={workspace.find((d) => d.id === documentId)?.name || null}
              onGoToContracts={() => setActive("Contracts")}
            />
          )}

          {active === "Playbooks" && <PlaybooksPage />}

          {active === "Knowledge" && (
            <KnowledgePage workspace={workspace} onOpenAnalysis={openAnalysis} />
          )}

          {active === "Team" && <TeamPage currentUserId={profile?.id} />}

          {active === "Settings" && <SettingsPage />}

          {active === "Admin" && isAdmin && <AdminPage />}
        </div>
      </main>
    </div>
  );
}
