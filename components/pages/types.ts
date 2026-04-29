export type Insights = { risks: string[]; keyClauses: string[]; summary: string };

export type WorkspaceDoc = {
  id: string;
  name: string;
  date: string;
  status: "Pending" | "Analyzed";
  fullText: string;
  insights: Insights | null;
  type?: string;
  riskLevel?: "Low" | "Medium" | "High";
  uploadedAt?: number;
};

export type AgentGoal = "risk" | "negotiate" | "favorable" | "standard" | "summary";

export type AgentRisk = {
  severity: "High" | "Medium" | "Low";
  title: string;
  explanation: string;
};

export type AgentMissingClause = { title: string; explanation: string };
export type AgentSuggestedEdit = { originalIssue: string; suggestedLanguage: string };

export type AgentResult = {
  agentSummary: string;
  keyRisks: AgentRisk[];
  missingClauses: AgentMissingClause[];
  negotiationPoints: string[];
  suggestedEdits: AgentSuggestedEdit[];
  clientEmailDraft: string;
};

export type TemplateItem = {
  id: string;
  name: string;
  body: string;
  updated_at: string;
  pdfFile?: string;
  pdfFileName?: string;
};

export type TeamMember = {
  id: string;
  name: string;
  email?: string;
  role: string;
  created_at?: string;
};

export type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  invite_link?: string;
  expires_at?: string;
  created_at?: string;
};

export type ComplianceMetrics = {
  riskyClausesFlagged: number;
  contractsReviewed: number;
  policyCompliance: number;
};

export type AdminStats = {
  monthlyActiveUsers: number;
  documentsAnalyzed: number;
  documentsUploaded: number;
  avgResponseSec: number;
};

export type DemoRequest = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
  job_title: string;
  team_size: string;
  phone: string | null;
  how_heard: string;
  created_at: string;
};

export type SettingsModel = {
  productName: string;
  primaryColor: string;
  policy: {
    governingLaw: string;
    liabilityCap: string;
    arbitration: "Required" | "Optional" | "Not allowed";
  };
};

export type PlaybookCategory =
  | "Risk Rules"
  | "Preferred Clauses"
  | "Negotiation Standards"
  | "Compliance Checks";

export type PlaybookRule = {
  id: string;
  text: string;
  category: PlaybookCategory;
  createdAt: string;
};

export function inferContractType(name: string): string {
  const n = name.toLowerCase();
  if (/\bnda\b|non[- ]disclosure/.test(n)) return "NDA";
  if (/\bmsa\b|master\s+service/.test(n)) return "MSA";
  if (/\bsow\b|statement\s+of\s+work/.test(n)) return "SOW";
  if (/\bdpa\b|data\s+processing/.test(n)) return "DPA";
  if (/\bsla\b|service\s+level/.test(n)) return "SLA";
  if (/lease/.test(n)) return "Lease";
  if (/employ/.test(n)) return "Employment";
  if (/license/.test(n)) return "License";
  if (/purchase/.test(n)) return "Purchase";
  if (/vendor/.test(n)) return "Vendor";
  if (/service/.test(n)) return "Service";
  return "Contract";
}

export function inferRiskLevel(insights: Insights | null): "Low" | "Medium" | "High" {
  if (!insights) return "Low";
  const n = insights.risks.length;
  if (n >= 4) return "High";
  if (n >= 1) return "Medium";
  return "Low";
}
