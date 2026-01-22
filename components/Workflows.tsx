"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Play,
  Pause,
  Plus,
  ChevronRight,
  ChevronDown,
  Settings,
  Trash2,
  Copy,
  Edit3,
  Check,
  X,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  ArrowDown,
  GitBranch,
  Zap,
  Eye,
  RotateCcw,
  Search,
  Filter,
  MoreVertical,
  FolderOpen,
  Calendar,
  User,
  Building2,
  Scale,
  FileSearch,
  Mail,
  MessageSquare,
  Database,
  Shield,
  Briefcase,
  Gavel,
  PenTool,
  ClipboardCheck,
  AlertTriangle,
  TrendingUp,
  History,
  BookOpen,
  Target,
  Layers,
  Workflow,
  CircleDot,
  GripVertical,
  Save,
  ChevronUp,
} from "lucide-react";

// ===== Types =====
type StepType = "input" | "ai-process" | "review" | "output" | "condition" | "loop";

type WorkflowStep = {
  id: string;
  type: StepType;
  name: string;
  description: string;
  config: Record<string, any>;
  status?: "pending" | "running" | "completed" | "failed" | "skipped";
  output?: string;
  duration?: number;
  userInput?: any;
};

type WorkflowTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  steps: WorkflowStep[];
  estimatedTime: string;
  popularity: number;
};

type WorkflowRun = {
  id: string;
  workflowId: string;
  workflowName: string;
  startedAt: Date;
  completedAt?: Date;
  status: "running" | "completed" | "failed" | "cancelled";
  currentStep: number;
  totalSteps: number;
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  steps: WorkflowStep[];
};

type CustomWorkflow = {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
  runCount: number;
};

type WorkflowResult = {
  id: string;
  workflowName: string;
  completedAt: Date;
  summary: string;
  sections: {
    title: string;
    content: string;
    type: "text" | "list" | "table";
    items?: string[];
    risk?: "high" | "medium" | "low";
  }[];
  documents: {
    name: string;
    type: string;
    size: string;
  }[];
};

// ===== Step Type Configuration =====
const STEP_TYPE_CONFIG: Record<StepType, { icon: React.ComponentType<any>; color: string; label: string; defaultConfig: Record<string, any> }> = {
  input: {
    icon: Upload,
    color: "blue",
    label: "Input",
    defaultConfig: { inputType: "file", fileTypes: ["pdf", "docx"], required: true, multiple: false }
  },
  "ai-process": {
    icon: Sparkles,
    color: "purple",
    label: "AI Process",
    defaultConfig: { model: "gpt-4", temperature: 0.7, maxTokens: 2000 }
  },
  review: {
    icon: Eye,
    color: "amber",
    label: "Review",
    defaultConfig: { required: true, reviewers: [] }
  },
  output: {
    icon: FileText,
    color: "green",
    label: "Output",
    defaultConfig: { format: "pdf", includeMetadata: true }
  },
  condition: {
    icon: GitBranch,
    color: "orange",
    label: "Condition",
    defaultConfig: { condition: "", trueBranch: "", falseBranch: "" }
  },
  loop: {
    icon: RotateCcw,
    color: "cyan",
    label: "Loop",
    defaultConfig: { iterations: 1, condition: "" }
  },
};

// ===== Workflow Templates =====
const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "contract-review",
    name: "Contract Review & Analysis",
    description: "Automatically analyze contracts for key terms, risks, and compliance issues",
    category: "Contracts",
    icon: FileSearch,
    estimatedTime: "5-10 min",
    popularity: 95,
    steps: [
      { id: "s1", type: "input", name: "Upload Contract", description: "Upload the contract document to analyze", config: { inputType: "file", fileTypes: ["pdf", "docx"], required: true, label: "Contract File" } },
      { id: "s2", type: "ai-process", name: "Extract Key Terms", description: "AI extracts parties, dates, obligations, and key clauses", config: { model: "legal-extraction", prompt: "Extract all key terms, parties, dates, and obligations from this contract." } },
      { id: "s3", type: "ai-process", name: "Risk Assessment", description: "Identify potential risks and unusual terms", config: { model: "risk-analysis", prompt: "Identify potential legal risks and unusual terms in this contract." } },
      { id: "s4", type: "ai-process", name: "Compliance Check", description: "Check against standard policies", config: { model: "compliance", prompt: "Check this contract against standard compliance requirements." } },
      { id: "s5", type: "review", name: "Human Review", description: "Review AI findings and make corrections", config: { required: true, instructions: "Review the AI analysis and approve or make corrections." } },
      { id: "s6", type: "output", name: "Generate Report", description: "Create comprehensive analysis report", config: { format: "pdf", template: "contract-analysis" } },
    ],
  },
  {
    id: "due-diligence",
    name: "Due Diligence Review",
    description: "Comprehensive due diligence workflow for M&A transactions",
    category: "M&A",
    icon: Briefcase,
    estimatedTime: "2-4 hours",
    popularity: 88,
    steps: [
      { id: "s1", type: "input", name: "Upload Documents", description: "Upload all due diligence documents", config: { inputType: "file", fileTypes: ["pdf", "docx", "xlsx"], required: true, multiple: true, label: "DD Documents" } },
      { id: "s2", type: "input", name: "Transaction Details", description: "Enter transaction information", config: { inputType: "form", fields: [{ name: "dealName", label: "Deal Name", type: "text" }, { name: "targetCompany", label: "Target Company", type: "text" }, { name: "dealValue", label: "Deal Value", type: "text" }] } },
      { id: "s3", type: "ai-process", name: "Document Classification", description: "Categorize documents by type", config: { model: "classification", prompt: "Classify these documents by type and relevance." } },
      { id: "s4", type: "ai-process", name: "Red Flag Detection", description: "Identify potential issues", config: { model: "risk-detection", prompt: "Identify any red flags or concerns in these documents." } },
      { id: "s5", type: "review", name: "Legal Review", description: "Attorney reviews findings", config: { required: true } },
      { id: "s6", type: "output", name: "DD Report", description: "Generate due diligence report", config: { format: "pdf" } },
    ],
  },
  {
    id: "legal-research",
    name: "Legal Research Assistant",
    description: "Research case law, statutes, and regulations on any legal topic",
    category: "Research",
    icon: BookOpen,
    estimatedTime: "15-30 min",
    popularity: 92,
    steps: [
      { id: "s1", type: "input", name: "Research Query", description: "Define your legal research question", config: { inputType: "textarea", required: true, label: "Research Question", placeholder: "Enter your legal research question..." } },
      { id: "s2", type: "input", name: "Jurisdiction", description: "Select applicable jurisdictions", config: { inputType: "select", required: true, label: "Jurisdiction", options: ["Federal", "California", "New York", "Delaware", "Texas", "Other State"] } },
      { id: "s3", type: "ai-process", name: "Case Law Search", description: "Search relevant case law", config: { model: "legal-search", prompt: "Find relevant case law and precedents." } },
      { id: "s4", type: "ai-process", name: "Statute Analysis", description: "Find applicable statutes", config: { model: "statute-analysis", prompt: "Identify and analyze applicable statutes." } },
      { id: "s5", type: "ai-process", name: "Synthesize Findings", description: "Combine research into analysis", config: { model: "synthesis", prompt: "Synthesize the research findings into a coherent analysis." } },
      { id: "s6", type: "output", name: "Research Memo", description: "Generate research memorandum", config: { format: "docx" } },
    ],
  },
  {
    id: "client-alert",
    name: "Client Alert Generator",
    description: "Create client alerts from new regulations or legal developments",
    category: "Communications",
    icon: Mail,
    estimatedTime: "10-20 min",
    popularity: 85,
    steps: [
      { id: "s1", type: "input", name: "Source Document", description: "Upload the source document", config: { inputType: "file", fileTypes: ["pdf", "docx"], required: true, label: "Source Document (regulation, opinion, etc.)" } },
      { id: "s2", type: "input", name: "Alert Topic", description: "Describe the alert topic", config: { inputType: "textarea", required: true, label: "Topic/Title", placeholder: "Brief description of the alert topic..." } },
      { id: "s3", type: "input", name: "Exemplar (Optional)", description: "Upload style guide", config: { inputType: "file", fileTypes: ["pdf", "docx"], required: false, label: "Prior Alert as Exemplar (optional)" } },
      { id: "s4", type: "ai-process", name: "Key Points Extraction", description: "Extract main takeaways", config: { model: "summarization", prompt: "Extract the key points and implications." } },
      { id: "s5", type: "ai-process", name: "Draft Alert", description: "Generate alert draft", config: { model: "drafting", prompt: "Draft a client alert based on the extracted information." } },
      { id: "s6", type: "review", name: "Partner Review", description: "Review and approve", config: { required: true } },
      { id: "s7", type: "output", name: "Final Alert", description: "Finalize client alert", config: { format: "docx" } },
    ],
  },
  {
    id: "contract-drafting",
    name: "Contract Drafting Assistant",
    description: "Draft contracts with AI assistance",
    category: "Contracts",
    icon: PenTool,
    estimatedTime: "30-60 min",
    popularity: 90,
    steps: [
      { id: "s1", type: "input", name: "Contract Type", description: "Select contract type", config: { inputType: "select", required: true, label: "Contract Type", options: ["NDA", "Master Services Agreement", "Employment Agreement", "License Agreement", "Partnership Agreement", "Other"] } },
      { id: "s2", type: "input", name: "Party Information", description: "Enter party details", config: { inputType: "form", fields: [{ name: "partyA", label: "Party A (Your Client)", type: "text" }, { name: "partyB", label: "Party B (Counterparty)", type: "text" }, { name: "effectiveDate", label: "Effective Date", type: "date" }] } },
      { id: "s3", type: "input", name: "Key Terms", description: "Enter key terms", config: { inputType: "textarea", required: true, label: "Key Terms & Special Requirements", placeholder: "Describe the key terms, obligations, and any special requirements..." } },
      { id: "s4", type: "input", name: "Template (Optional)", description: "Upload existing template", config: { inputType: "file", fileTypes: ["pdf", "docx"], required: false, label: "Template or Prior Contract (optional)" } },
      { id: "s5", type: "ai-process", name: "Generate Draft", description: "AI generates contract", config: { model: "contract-generation", prompt: "Generate a contract draft based on the provided information." } },
      { id: "s6", type: "review", name: "Attorney Review", description: "Review and edit", config: { required: true } },
      { id: "s7", type: "output", name: "Final Contract", description: "Generate final contract", config: { format: "docx" } },
    ],
  },
  {
    id: "compliance-audit",
    name: "Compliance Audit",
    description: "Audit documents against regulatory requirements",
    category: "Compliance",
    icon: ClipboardCheck,
    estimatedTime: "1-2 hours",
    popularity: 78,
    steps: [
      { id: "s1", type: "input", name: "Regulation Type", description: "Select regulation", config: { inputType: "select", required: true, label: "Regulation/Standard", options: ["GDPR", "CCPA", "HIPAA", "SOX", "SEC Rules", "Custom"] } },
      { id: "s2", type: "input", name: "Documents", description: "Upload documents to audit", config: { inputType: "file", fileTypes: ["pdf", "docx", "xlsx"], required: true, multiple: true, label: "Documents to Audit" } },
      { id: "s3", type: "ai-process", name: "Requirement Mapping", description: "Map requirements to documents", config: { model: "compliance-mapping", prompt: "Map regulatory requirements to document provisions." } },
      { id: "s4", type: "ai-process", name: "Gap Analysis", description: "Identify compliance gaps", config: { model: "gap-analysis", prompt: "Identify compliance gaps and deficiencies." } },
      { id: "s5", type: "review", name: "Compliance Review", description: "Review findings", config: { required: true } },
      { id: "s6", type: "output", name: "Audit Report", description: "Generate audit report", config: { format: "pdf" } },
    ],
  },
];

const CATEGORIES = ["All", "Contracts", "M&A", "Research", "Communications", "Compliance", "Litigation", "Operations"];

// ===== Helper Functions =====
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const getColorClasses = (color: string, type: "bg" | "text" | "border") => {
  const colors: Record<string, Record<string, string>> = {
    blue: { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200" },
    purple: { bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200" },
    amber: { bg: "bg-amber-100", text: "text-amber-600", border: "border-amber-200" },
    green: { bg: "bg-green-100", text: "text-green-600", border: "border-green-200" },
    orange: { bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200" },
    cyan: { bg: "bg-cyan-100", text: "text-cyan-600", border: "border-cyan-200" },
  };
  return colors[color]?.[type] || "";
};

export default function Workflows() {
  // ===== State =====
  const [activeView, setActiveView] = useState<"templates" | "my-workflows" | "runs" | "builder">("templates");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Workflow Execution State
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | CustomWorkflow | null>(null);
  const [executionSteps, setExecutionSteps] = useState<WorkflowStep[]>([]);
  const [currentPhase, setCurrentPhase] = useState<"setup" | "input" | "running" | "review" | "complete">("setup");
  const [currentInputStepIndex, setCurrentInputStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [stepInputs, setStepInputs] = useState<Record<string, any>>({});

  // Builder State
  const [builderSteps, setBuilderSteps] = useState<WorkflowStep[]>([]);
  const [builderName, setBuilderName] = useState("");
  const [builderDescription, setBuilderDescription] = useState("");
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [draggedStepType, setDraggedStepType] = useState<StepType | null>(null);
  const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null);

  // My Workflows
  const [myWorkflows, setMyWorkflows] = useState<CustomWorkflow[]>([]);

  // Run History
  const [runHistory, setRunHistory] = useState<WorkflowRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);

  // Workflow Results
  const [workflowResult, setWorkflowResult] = useState<WorkflowResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentFileStepId, setCurrentFileStepId] = useState<string | null>(null);

  // ===== Computed =====
  const filteredTemplates = WORKFLOW_TEMPLATES.filter(t => {
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    const matchesSearch = searchQuery === "" ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const inputSteps = executionSteps.filter(s => s.type === "input");
  const currentInputStep = inputSteps[currentInputStepIndex];

  // ===== Workflow Selection & Setup =====
  const selectWorkflow = (workflow: WorkflowTemplate | CustomWorkflow) => {
    setSelectedWorkflow(workflow);
    setExecutionSteps(workflow.steps.map(s => ({ ...s, status: "pending", userInput: undefined })));
    setCurrentPhase("input");
    setCurrentInputStepIndex(0);
    setStepInputs({});
    setCurrentStepIndex(-1);
    setIsRunning(false);
  };

  const closeWorkflow = () => {
    setSelectedWorkflow(null);
    setExecutionSteps([]);
    setCurrentPhase("setup");
    setCurrentInputStepIndex(0);
    setStepInputs({});
    setIsRunning(false);
    setWorkflowResult(null);
    setShowResults(false);
  };

  // ===== Input Collection =====
  const handleInputChange = (stepId: string, value: any) => {
    setStepInputs(prev => ({ ...prev, [stepId]: value }));
    setExecutionSteps(prev => prev.map(s =>
      s.id === stepId ? { ...s, userInput: value } : s
    ));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentFileStepId || !e.target.files) return;
    const files = Array.from(e.target.files);
    const step = executionSteps.find(s => s.id === currentFileStepId);

    if (step?.config.multiple) {
      const existingFiles = stepInputs[currentFileStepId] || [];
      handleInputChange(currentFileStepId, [...existingFiles, ...files]);
    } else {
      handleInputChange(currentFileStepId, files[0]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    setCurrentFileStepId(null);
  };

  const removeFile = (stepId: string, fileIndex?: number) => {
    const currentValue = stepInputs[stepId];
    if (Array.isArray(currentValue) && fileIndex !== undefined) {
      const newFiles = currentValue.filter((_, i) => i !== fileIndex);
      handleInputChange(stepId, newFiles);
    } else {
      handleInputChange(stepId, null);
    }
  };

  const canProceedToNextInput = () => {
    if (!currentInputStep) return true;
    const value = stepInputs[currentInputStep.id];
    if (!currentInputStep.config.required) return true;
    if (currentInputStep.config.inputType === "file") {
      return value && (Array.isArray(value) ? value.length > 0 : true);
    }
    return value && value.toString().trim() !== "";
  };

  const nextInputStep = () => {
    if (currentInputStepIndex < inputSteps.length - 1) {
      setCurrentInputStepIndex(prev => prev + 1);
    } else {
      setCurrentPhase("running");
      runWorkflow();
    }
  };

  const prevInputStep = () => {
    if (currentInputStepIndex > 0) {
      setCurrentInputStepIndex(prev => prev - 1);
    }
  };

  // ===== Workflow Execution =====
  const runWorkflow = async () => {
    if (!selectedWorkflow) return;
    setIsRunning(true);

    const newRun: WorkflowRun = {
      id: generateId(),
      workflowId: selectedWorkflow.id,
      workflowName: selectedWorkflow.name,
      startedAt: new Date(),
      status: "running",
      currentStep: 0,
      totalSteps: executionSteps.length,
      inputs: stepInputs,
      steps: [...executionSteps],
    };
    setRunHistory(prev => [newRun, ...prev]);

    for (let i = 0; i < executionSteps.length; i++) {
      const step = executionSteps[i];

      // Skip input steps (already collected)
      if (step.type === "input") {
        setExecutionSteps(prev => prev.map((s, idx) =>
          idx === i ? { ...s, status: "completed", output: "Input collected" } : s
        ));
        continue;
      }

      setCurrentStepIndex(i);
      setExecutionSteps(prev => prev.map((s, idx) =>
        idx === i ? { ...s, status: "running" } : s
      ));

      // Handle review steps
      if (step.type === "review") {
        setCurrentPhase("review");
        setExecutionSteps(prev => prev.map((s, idx) =>
          idx === i ? { ...s, status: "running", output: "Waiting for human review..." } : s
        ));

        // Wait for review approval (simulated with timeout for demo)
        await new Promise<void>((resolve) => {
          const checkReview = setInterval(() => {
            // In real app, this would wait for user action
            // For demo, auto-approve after 2 seconds
            clearInterval(checkReview);
            resolve();
          }, 2000);
        });

        setExecutionSteps(prev => prev.map((s, idx) =>
          idx === i ? { ...s, status: "completed", output: "Review approved", duration: 2000 } : s
        ));
        setCurrentPhase("running");
        continue;
      }

      // Simulate AI processing
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
      const duration = Date.now() - startTime;

      const stepOutput = generateStepOutput(step);
      setExecutionSteps(prev => prev.map((s, idx) =>
        idx === i ? { ...s, status: "completed", output: stepOutput, duration } : s
      ));

      // Update run history
      setRunHistory(prev => prev.map(r =>
        r.id === newRun.id ? { ...r, currentStep: i + 1 } : r
      ));
    }

    // Complete - Generate results
    const results = generateWorkflowResults(selectedWorkflow, stepInputs);
    setWorkflowResult(results);
    setShowResults(true);
    setCurrentPhase("complete");
    setRunHistory(prev => prev.map(r =>
      r.id === newRun.id ? {
        ...r,
        status: "completed",
        completedAt: new Date(),
        steps: executionSteps,
        outputs: { report: "Generated successfully" }
      } : r
    ));
    setIsRunning(false);
  };

  const generateStepOutput = (step: WorkflowStep): string => {
    const outputs: Record<string, string[]> = {
      "ai-process": [
        "Analysis complete. Found 12 key terms and 3 potential risks.",
        "Extracted 8 clauses and identified 2 compliance issues.",
        "Processed successfully. Generated 15 insights.",
        "Classification complete. Categorized 24 documents.",
        "Research complete. Found 18 relevant cases and 5 statutes.",
      ],
      output: [
        "Report generated successfully (PDF, 12 pages)",
        "Document created successfully (DOCX, 8 pages)",
        "Export complete. File ready for download.",
      ],
      review: [
        "Review approved by user.",
        "Changes accepted and applied.",
      ],
    };

    const options = outputs[step.type] || ["Step completed successfully."];
    return options[Math.floor(Math.random() * options.length)];
  };

  const generateWorkflowResults = (workflow: WorkflowTemplate | CustomWorkflow, inputs: Record<string, any>): WorkflowResult => {
    const workflowId = workflow.id;

    // Get uploaded file name if any
    const uploadedFileName = Object.values(inputs).find(v => v?.name)?.name || "Uploaded Document";

    const resultTemplates: Record<string, Omit<WorkflowResult, "id" | "completedAt">> = {
      "contract-review": {
        workflowName: "Contract Review & Analysis",
        summary: `Comprehensive analysis of "${uploadedFileName}" completed. The AI identified key contract terms, potential risks, and compliance considerations.`,
        sections: [
          {
            title: "Key Terms Extracted",
            content: "The following key terms were identified in the contract:",
            type: "list",
            items: [
              "Parties: Acme Corporation & Beta Industries",
              "Effective Date: January 15, 2024",
              "Term: 24 months with auto-renewal",
              "Governing Law: State of Delaware",
              "Payment Terms: Net 30 days",
              "Termination: 90 days written notice",
              "Liability Cap: $500,000",
              "Indemnification: Mutual indemnification clause"
            ]
          },
          {
            title: "Risk Assessment",
            content: "3 potential risks identified:",
            type: "list",
            risk: "medium",
            items: [
              "HIGH: Unlimited liability for IP infringement claims (Section 8.2)",
              "MEDIUM: Broad force majeure clause may excuse performance (Section 12.1)",
              "LOW: Assignment clause allows transfer with notice only (Section 15.3)"
            ]
          },
          {
            title: "Compliance Check",
            content: "Contract reviewed against standard compliance requirements:",
            type: "list",
            items: [
              "✓ GDPR data processing terms included",
              "✓ Confidentiality obligations properly defined",
              "⚠ Missing specific data retention period",
              "✓ Dispute resolution mechanism in place",
              "⚠ Consider adding cybersecurity requirements"
            ]
          },
          {
            title: "Recommendations",
            content: "Based on the analysis, we recommend the following actions before signing:",
            type: "list",
            items: [
              "Negotiate a cap on IP indemnification liability",
              "Add specific data retention period (suggest 3 years)",
              "Include cybersecurity and incident notification requirements",
              "Clarify the scope of the force majeure clause"
            ]
          }
        ],
        documents: [
          { name: "Contract_Analysis_Report.pdf", type: "PDF", size: "2.4 MB" },
          { name: "Risk_Assessment_Summary.docx", type: "Word", size: "156 KB" },
          { name: "Key_Terms_Extract.xlsx", type: "Excel", size: "45 KB" }
        ]
      },
      "due-diligence": {
        workflowName: "Due Diligence Review",
        summary: "Comprehensive due diligence review completed. 24 documents analyzed across corporate, financial, and legal categories.",
        sections: [
          {
            title: "Document Classification",
            content: "Documents categorized by type:",
            type: "list",
            items: [
              "Corporate Documents: 8 files",
              "Financial Statements: 6 files",
              "Contracts & Agreements: 7 files",
              "Regulatory Filings: 3 files"
            ]
          },
          {
            title: "Red Flags Identified",
            content: "The following concerns require attention:",
            type: "list",
            risk: "high",
            items: [
              "HIGH: Pending litigation ($2.5M claim) not disclosed in financials",
              "MEDIUM: Key executive employment agreements expire within 6 months",
              "MEDIUM: Material contract with largest customer up for renewal",
              "LOW: Minor discrepancies in inventory valuations"
            ]
          },
          {
            title: "Key Findings",
            content: "Summary of due diligence findings:",
            type: "text"
          }
        ],
        documents: [
          { name: "Due_Diligence_Report.pdf", type: "PDF", size: "4.8 MB" },
          { name: "Document_Index.xlsx", type: "Excel", size: "125 KB" },
          { name: "Red_Flag_Summary.pdf", type: "PDF", size: "890 KB" }
        ]
      },
      "legal-research": {
        workflowName: "Legal Research Assistant",
        summary: "Legal research completed. Found 18 relevant cases and 5 applicable statutes addressing your research question.",
        sections: [
          {
            title: "Relevant Case Law",
            content: "Key cases identified:",
            type: "list",
            items: [
              "Smith v. Johnson Corp (2023) - Directly on point regarding liability",
              "ABC Industries v. XYZ Co (2022) - Establishes burden of proof standard",
              "State v. Morrison (2021) - Addresses statutory interpretation",
              "Harris v. National Corp (2020) - Key precedent in this jurisdiction"
            ]
          },
          {
            title: "Applicable Statutes",
            content: "Relevant statutory provisions:",
            type: "list",
            items: [
              "Commercial Code § 2-314 - Implied warranties",
              "Civil Code § 1542 - General release provisions",
              "Business Code § 17200 - Unfair competition",
              "Evidence Code § 1152 - Settlement negotiations"
            ]
          },
          {
            title: "Analysis Summary",
            content: "Based on the research, the legal position appears favorable. The weight of authority supports the proposed interpretation, though there is some contrary authority that should be addressed.",
            type: "text"
          }
        ],
        documents: [
          { name: "Legal_Research_Memo.docx", type: "Word", size: "1.2 MB" },
          { name: "Case_Summaries.pdf", type: "PDF", size: "2.1 MB" },
          { name: "Statutory_Analysis.pdf", type: "PDF", size: "450 KB" }
        ]
      },
      "client-alert": {
        workflowName: "Client Alert Generator",
        summary: "Client alert drafted based on the source document. The alert summarizes key developments and their implications for clients.",
        sections: [
          {
            title: "Key Takeaways",
            content: "Main points for client communication:",
            type: "list",
            items: [
              "New regulation takes effect March 1, 2024",
              "Impacts companies with annual revenue over $10M",
              "Compliance deadline: 90 days from effective date",
              "Penalties for non-compliance: Up to $100,000 per violation"
            ]
          },
          {
            title: "Action Items",
            content: "Recommended next steps for clients:",
            type: "list",
            items: [
              "Review current policies against new requirements",
              "Update internal procedures by February 15",
              "Train relevant staff on new compliance obligations",
              "Schedule compliance audit within 60 days"
            ]
          }
        ],
        documents: [
          { name: "Client_Alert_Draft.docx", type: "Word", size: "245 KB" },
          { name: "Regulation_Summary.pdf", type: "PDF", size: "180 KB" }
        ]
      },
      "contract-drafting": {
        workflowName: "Contract Drafting Assistant",
        summary: "Contract draft generated based on your specifications. Please review all terms carefully before use.",
        sections: [
          {
            title: "Document Overview",
            content: "Contract details:",
            type: "list",
            items: [
              "Contract Type: Master Services Agreement",
              "Total Sections: 15",
              "Schedules/Exhibits: 3",
              "Estimated Pages: 18"
            ]
          },
          {
            title: "Key Provisions",
            content: "Important clauses included:",
            type: "list",
            items: [
              "Scope of Services (Section 2)",
              "Payment Terms - Net 30 (Section 4)",
              "Intellectual Property Rights (Section 7)",
              "Limitation of Liability (Section 9)",
              "Term and Termination (Section 11)",
              "Confidentiality (Section 13)"
            ]
          },
          {
            title: "Review Notes",
            content: "The following sections may require additional customization based on your specific needs: pricing schedule, service level agreements, and jurisdiction-specific requirements.",
            type: "text"
          }
        ],
        documents: [
          { name: "Contract_Draft.docx", type: "Word", size: "385 KB" },
          { name: "Schedule_A_Services.docx", type: "Word", size: "125 KB" },
          { name: "Schedule_B_Pricing.xlsx", type: "Excel", size: "45 KB" }
        ]
      },
      "compliance-audit": {
        workflowName: "Compliance Audit",
        summary: "Compliance audit completed against selected regulatory framework. 87% overall compliance score achieved.",
        sections: [
          {
            title: "Compliance Score",
            content: "Overall compliance assessment:",
            type: "list",
            items: [
              "Data Protection: 92% compliant",
              "Security Controls: 85% compliant",
              "Documentation: 78% compliant",
              "Incident Response: 90% compliant"
            ]
          },
          {
            title: "Gap Analysis",
            content: "Areas requiring attention:",
            type: "list",
            risk: "medium",
            items: [
              "HIGH: Data retention policy needs update (Section 4.2)",
              "MEDIUM: Vendor assessment documentation incomplete",
              "MEDIUM: Employee training records not current",
              "LOW: Minor policy formatting inconsistencies"
            ]
          },
          {
            title: "Remediation Timeline",
            content: "Recommended timeline for addressing gaps: High priority items within 30 days, Medium within 60 days, Low within 90 days.",
            type: "text"
          }
        ],
        documents: [
          { name: "Compliance_Audit_Report.pdf", type: "PDF", size: "3.2 MB" },
          { name: "Gap_Analysis.xlsx", type: "Excel", size: "156 KB" },
          { name: "Remediation_Plan.docx", type: "Word", size: "210 KB" }
        ]
      }
    };

    const template = resultTemplates[workflowId] || {
      workflowName: workflow.name,
      summary: `Workflow "${workflow.name}" completed successfully. All steps have been processed.`,
      sections: [
        {
          title: "Workflow Summary",
          content: "The workflow completed all steps successfully.",
          type: "text" as const
        }
      ],
      documents: [
        { name: "Workflow_Output.pdf", type: "PDF", size: "1.5 MB" }
      ]
    };

    return {
      ...template,
      id: generateId(),
      completedAt: new Date()
    };
  };

  const downloadDocument = (doc: { name: string; type: string; size: string }) => {
    // In a real app, this would download the actual file
    // For demo, we'll create a mock text file
    const content = `This is a simulated ${doc.type} document: ${doc.name}\n\nGenerated by AgileClause Workflows\nDate: ${new Date().toLocaleString()}\n\nIn a production environment, this would contain the actual generated content.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name.replace(/\.(pdf|docx|xlsx)$/, ".txt");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const approveReview = () => {
    // This would be called when user approves a review step
    setExecutionSteps(prev => prev.map(s =>
      s.status === "running" && s.type === "review"
        ? { ...s, status: "completed", output: "Review approved" }
        : s
    ));
  };

  // ===== Builder Functions =====
  const addStepToBuilder = (type: StepType) => {
    const config = STEP_TYPE_CONFIG[type];
    const newStep: WorkflowStep = {
      id: generateId(),
      type,
      name: `New ${config.label}`,
      description: `Configure this ${config.label.toLowerCase()} step`,
      config: { ...config.defaultConfig },
    };
    setBuilderSteps(prev => [...prev, newStep]);
    setEditingStepId(newStep.id);
  };

  const updateBuilderStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setBuilderSteps(prev => prev.map(s =>
      s.id === stepId ? { ...s, ...updates } : s
    ));
  };

  const deleteBuilderStep = (stepId: string) => {
    setBuilderSteps(prev => prev.filter(s => s.id !== stepId));
    if (editingStepId === stepId) setEditingStepId(null);
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    setBuilderSteps(prev => {
      const newSteps = [...prev];
      const [moved] = newSteps.splice(fromIndex, 1);
      newSteps.splice(toIndex, 0, moved);
      return newSteps;
    });
  };

  const saveWorkflow = () => {
    if (!builderName.trim() || builderSteps.length === 0) {
      alert("Please enter a workflow name and add at least one step.");
      return;
    }

    const newWorkflow: CustomWorkflow = {
      id: generateId(),
      name: builderName,
      description: builderDescription,
      steps: builderSteps,
      createdAt: new Date(),
      updatedAt: new Date(),
      runCount: 0,
    };

    setMyWorkflows(prev => [...prev, newWorkflow]);
    setBuilderName("");
    setBuilderDescription("");
    setBuilderSteps([]);
    setActiveView("my-workflows");
  };

  const editWorkflow = (workflow: CustomWorkflow) => {
    setBuilderName(workflow.name);
    setBuilderDescription(workflow.description);
    setBuilderSteps([...workflow.steps]);
    setActiveView("builder");
    // Remove old version (will be re-saved)
    setMyWorkflows(prev => prev.filter(w => w.id !== workflow.id));
  };

  const deleteWorkflow = (workflowId: string) => {
    if (confirm("Are you sure you want to delete this workflow?")) {
      setMyWorkflows(prev => prev.filter(w => w.id !== workflowId));
    }
  };

  const duplicateWorkflow = (workflow: CustomWorkflow) => {
    const newWorkflow: CustomWorkflow = {
      ...workflow,
      id: generateId(),
      name: workflow.name + " (Copy)",
      createdAt: new Date(),
      updatedAt: new Date(),
      runCount: 0,
    };
    setMyWorkflows(prev => [...prev, newWorkflow]);
  };

  // ===== Render Helpers =====
  const renderInputField = (step: WorkflowStep) => {
    const value = stepInputs[step.id];
    const config = step.config;

    switch (config.inputType) {
      case "file":
        return (
          <div className="space-y-3">
            <div
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-violet-400 transition cursor-pointer"
              onClick={() => {
                setCurrentFileStepId(step.id);
                fileInputRef.current?.click();
              }}
            >
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-slate-400">
                {config.fileTypes?.map((t: string) => t.toUpperCase()).join(", ")} files
                {config.multiple && " (multiple allowed)"}
              </p>
            </div>

            {/* Show uploaded files */}
            {value && (
              <div className="space-y-2">
                {(Array.isArray(value) ? value : [value]).map((file: File, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(step.id, Array.isArray(value) ? idx : undefined)}
                      className="p-1 hover:bg-slate-200 rounded"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "textarea":
        return (
          <textarea
            value={value || ""}
            onChange={(e) => handleInputChange(step.id, e.target.value)}
            placeholder={config.placeholder || "Enter your response..."}
            rows={5}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        );

      case "select":
        return (
          <div className="grid grid-cols-2 gap-2">
            {config.options?.map((option: string) => (
              <button
                key={option}
                onClick={() => handleInputChange(step.id, option)}
                className={`px-4 py-3 rounded-xl border text-left transition ${
                  value === option
                    ? "border-violet-500 bg-violet-50 text-violet-700"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  {value === option && <Check className="w-4 h-4" />}
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        );

      case "form":
        return (
          <div className="space-y-4">
            {config.fields?.map((field: any) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type || "text"}
                  value={(value?.[field.name]) || ""}
                  onChange={(e) => handleInputChange(step.id, { ...value, [field.name]: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => handleInputChange(step.id, e.target.value)}
            placeholder="Enter value..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        );
    }
  };

  const getStatusIcon = (status?: WorkflowStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "running":
        return <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "skipped":
        return <X className="w-5 h-5 text-slate-400" />;
      default:
        return <CircleDot className="w-5 h-5 text-slate-300" />;
    }
  };

  // ===== Main Render =====
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        multiple={executionSteps.find(s => s.id === currentFileStepId)?.config.multiple}
        accept={executionSteps.find(s => s.id === currentFileStepId)?.config.fileTypes?.map((t: string) => `.${t}`).join(",")}
      />

      {/* Sidebar */}
      <div className="w-64 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Workflow className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-slate-900">Workflows</h1>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => { setActiveView("templates"); closeWorkflow(); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              activeView === "templates" ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Layers className="w-4 h-4" />
            Templates
          </button>
          <button
            onClick={() => { setActiveView("my-workflows"); closeWorkflow(); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              activeView === "my-workflows" ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            My Workflows
            {myWorkflows.length > 0 && (
              <span className="ml-auto text-xs bg-slate-100 px-2 py-0.5 rounded-full">{myWorkflows.length}</span>
            )}
          </button>
          <button
            onClick={() => { setActiveView("runs"); closeWorkflow(); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              activeView === "runs" ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <History className="w-4 h-4" />
            Run History
            {runHistory.some(r => r.status === "running") && (
              <span className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </button>
          <button
            onClick={() => { setActiveView("builder"); closeWorkflow(); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              activeView === "builder" ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Plus className="w-4 h-4" />
            Build Custom
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-2 text-center text-sm">
            <div className="p-2 bg-slate-50 rounded-lg">
              <p className="font-semibold text-slate-900">{runHistory.filter(r => r.status === "completed").length}</p>
              <p className="text-xs text-slate-500">Completed</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <p className="font-semibold text-slate-900">{runHistory.filter(r => r.status === "running").length}</p>
              <p className="text-xs text-slate-500">Running</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ===== WORKFLOW EXECUTION VIEW ===== */}
        {selectedWorkflow && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-4">
                <button onClick={closeWorkflow} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{selectedWorkflow.name}</h2>
                  <p className="text-sm text-slate-500">
                    {currentPhase === "input" && `Step ${currentInputStepIndex + 1} of ${inputSteps.length} inputs`}
                    {currentPhase === "running" && `Processing step ${currentStepIndex + 1} of ${executionSteps.length}`}
                    {currentPhase === "review" && "Waiting for review..."}
                    {currentPhase === "complete" && "Workflow complete!"}
                  </p>
                </div>
              </div>

              {/* Phase indicator */}
              <div className="flex items-center gap-2">
                {["input", "running", "complete"].map((phase, idx) => (
                  <div key={phase} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentPhase === phase ? "bg-violet-600 text-white" :
                      (phase === "input" && currentPhase !== "input") ||
                      (phase === "running" && currentPhase === "complete")
                        ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                    }`}>
                      {(phase === "input" && currentPhase !== "input") ||
                       (phase === "running" && currentPhase === "complete")
                        ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    {idx < 2 && <div className="w-12 h-0.5 bg-slate-200" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto pb-8">

                {/* INPUT COLLECTION PHASE */}
                {currentPhase === "input" && currentInputStep && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <div className={`w-16 h-16 ${getColorClasses(STEP_TYPE_CONFIG[currentInputStep.type].color, "bg")} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                        <Upload className={`w-8 h-8 ${getColorClasses(STEP_TYPE_CONFIG[currentInputStep.type].color, "text")}`} />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">{currentInputStep.name}</h3>
                      <p className="text-slate-500">{currentInputStep.description}</p>
                      {!currentInputStep.config.required && (
                        <span className="inline-block mt-2 text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Optional</span>
                      )}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6">
                      {renderInputField(currentInputStep)}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4">
                      <button
                        onClick={prevInputStep}
                        disabled={currentInputStepIndex === 0}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
                        Previous
                      </button>

                      <div className="flex items-center gap-2">
                        {!currentInputStep.config.required && (
                          <button
                            onClick={nextInputStep}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                          >
                            Skip
                          </button>
                        )}
                        <button
                          onClick={nextInputStep}
                          disabled={!canProceedToNextInput()}
                          className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {currentInputStepIndex < inputSteps.length - 1 ? "Continue" : "Run Workflow"}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress dots */}
                    <div className="flex justify-center gap-2 pt-4">
                      {inputSteps.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full transition ${
                            idx === currentInputStepIndex ? "bg-violet-600" :
                            idx < currentInputStepIndex ? "bg-green-500" : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* EXECUTION PHASE */}
                {(currentPhase === "running" || currentPhase === "review" || currentPhase === "complete") && (
                  <div className="space-y-4">
                    {/* Progress bar */}
                    {isRunning && (
                      <div className="mb-6 p-4 bg-violet-50 border border-violet-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-violet-700">
                            {executionSteps[currentStepIndex]?.name || "Processing..."}
                          </span>
                          <span className="text-sm text-violet-600">
                            {Math.round((executionSteps.filter(s => s.status === "completed").length / executionSteps.length) * 100)}%
                          </span>
                        </div>
                        <div className="h-2 bg-violet-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-600 rounded-full transition-all duration-500"
                            style={{ width: `${(executionSteps.filter(s => s.status === "completed").length / executionSteps.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Complete message with results */}
                    {currentPhase === "complete" && workflowResult && (
                      <div className="space-y-6">
                        {/* Success header */}
                        <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-7 h-7 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-green-700 mb-1">Workflow Complete!</h3>
                              <p className="text-green-600 text-sm">{workflowResult.summary}</p>
                              <p className="text-xs text-green-500 mt-2">
                                Completed at {workflowResult.completedAt.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Generated Documents */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5">
                          <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-violet-600" />
                            Generated Documents
                          </h4>
                          <div className="space-y-3">
                            {workflowResult.documents.map((doc, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    doc.type === "PDF" ? "bg-red-100" :
                                    doc.type === "Word" ? "bg-blue-100" :
                                    "bg-green-100"
                                  }`}>
                                    <FileText className={`w-5 h-5 ${
                                      doc.type === "PDF" ? "text-red-600" :
                                      doc.type === "Word" ? "text-blue-600" :
                                      "text-green-600"
                                    }`} />
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-900">{doc.name}</p>
                                    <p className="text-xs text-slate-500">{doc.type} • {doc.size}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => downloadDocument(doc)}
                                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                  Download
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Analysis Sections */}
                        {workflowResult.sections.map((section, idx) => (
                          <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5">
                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                              {section.risk === "high" ? (
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                              ) : section.risk === "medium" ? (
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                              ) : (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              )}
                              {section.title}
                              {section.risk && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  section.risk === "high" ? "bg-red-100 text-red-700" :
                                  section.risk === "medium" ? "bg-amber-100 text-amber-700" :
                                  "bg-green-100 text-green-700"
                                }`}>
                                  {section.risk.toUpperCase()} RISK
                                </span>
                              )}
                            </h4>
                            <p className="text-sm text-slate-600 mb-3">{section.content}</p>
                            {section.items && (
                              <ul className="space-y-2">
                                {section.items.map((item, itemIdx) => (
                                  <li key={itemIdx} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="text-slate-400 mt-1">•</span>
                                    <span className={
                                      item.startsWith("HIGH:") ? "text-red-600" :
                                      item.startsWith("MEDIUM:") ? "text-amber-600" :
                                      item.startsWith("LOW:") ? "text-slate-600" :
                                      item.startsWith("✓") ? "text-green-600" :
                                      item.startsWith("⚠") ? "text-amber-600" :
                                      ""
                                    }>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-4">
                          <button
                            onClick={() => setShowResults(false)}
                            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
                          >
                            <Eye className="w-4 h-4" />
                            View Execution Steps
                          </button>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                // Re-run the same workflow
                                if (selectedWorkflow) {
                                  selectWorkflow(selectedWorkflow);
                                }
                              }}
                              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Run Again
                            </button>
                            <button
                              onClick={closeWorkflow}
                              className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition"
                            >
                              <Check className="w-4 h-4" />
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Show execution steps when not showing results, or when viewing steps from results */}
                    {currentPhase === "complete" && !showResults && (
                      <div className="mb-6">
                        <button
                          onClick={() => setShowResults(true)}
                          className="mb-4 flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-xl hover:bg-violet-200 transition"
                        >
                          <FileText className="w-4 h-4" />
                          View Results & Documents
                        </button>
                      </div>
                    )}

                    {/* Steps list - hide when showing results */}
                    {!(currentPhase === "complete" && showResults) && executionSteps.map((step, index) => {
                      const StepIcon = STEP_TYPE_CONFIG[step.type].icon;
                      const color = STEP_TYPE_CONFIG[step.type].color;

                      return (
                        <div
                          key={step.id}
                          className={`flex items-start gap-4 p-4 bg-white border rounded-xl transition ${
                            step.status === "running" ? "border-violet-300 ring-2 ring-violet-100" :
                            step.status === "completed" ? "border-green-200" : "border-slate-200"
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            {getStatusIcon(step.status)}
                            {index < executionSteps.length - 1 && (
                              <div className={`w-0.5 h-8 mt-2 ${step.status === "completed" ? "bg-green-300" : "bg-slate-200"}`} />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-6 h-6 rounded flex items-center justify-center ${getColorClasses(color, "bg")}`}>
                                <StepIcon className={`w-4 h-4 ${getColorClasses(color, "text")}`} />
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded ${getColorClasses(color, "bg")} ${getColorClasses(color, "text")}`}>
                                {STEP_TYPE_CONFIG[step.type].label}
                              </span>
                              <h4 className="font-medium text-slate-900">{step.name}</h4>
                            </div>
                            <p className="text-sm text-slate-500">{step.description}</p>

                            {/* Show user input for input steps */}
                            {step.type === "input" && step.userInput && (
                              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                                {typeof step.userInput === "object" && step.userInput.name
                                  ? `File: ${step.userInput.name}`
                                  : Array.isArray(step.userInput)
                                    ? `Files: ${step.userInput.map((f: File) => f.name).join(", ")}`
                                    : typeof step.userInput === "object"
                                      ? Object.entries(step.userInput).map(([k, v]) => `${k}: ${v}`).join(", ")
                                      : step.userInput
                                }
                              </div>
                            )}

                            {/* Step output */}
                            {step.output && (
                              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-700">{step.output}</p>
                                {step.duration && (
                                  <p className="text-xs text-green-600 mt-1">
                                    Completed in {(step.duration / 1000).toFixed(1)}s
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== TEMPLATES VIEW ===== */}
        {activeView === "templates" && !selectedWorkflow && (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Workflow Templates</h2>
                <p className="text-sm text-slate-500">Pre-built workflows to automate legal tasks</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>
            </div>

            <div className="px-6 py-3 border-b border-slate-200 bg-white">
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-lg text-sm transition ${
                      selectedCategory === cat
                        ? "bg-violet-100 text-violet-700"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map(template => {
                  const Icon = template.icon;
                  return (
                    <div
                      key={template.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:border-violet-200 transition cursor-pointer group"
                      onClick={() => selectWorkflow(template)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-violet-600" />
                        </div>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                          {template.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-violet-600 transition">
                        {template.name}
                      </h3>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {template.steps.length} steps
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {template.estimatedTime}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ===== MY WORKFLOWS VIEW ===== */}
        {activeView === "my-workflows" && !selectedWorkflow && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">My Workflows</h2>
                <p className="text-sm text-slate-500">Custom workflows you&apos;ve created</p>
              </div>
              <button
                onClick={() => setActiveView("builder")}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition"
              >
                <Plus className="w-4 h-4" />
                Create Workflow
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {myWorkflows.length === 0 ? (
                <div className="text-center py-12">
                  <Workflow className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-2">No custom workflows yet</p>
                  <p className="text-sm text-slate-400 mb-4">Create your first workflow to automate repetitive tasks</p>
                  <button
                    onClick={() => setActiveView("builder")}
                    className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700"
                  >
                    Create Workflow
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myWorkflows.map(workflow => (
                    <div key={workflow.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-slate-900">{workflow.name}</h3>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => editWorkflow(workflow)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg"
                          >
                            <Edit3 className="w-4 h-4 text-slate-500" />
                          </button>
                          <button
                            onClick={() => duplicateWorkflow(workflow)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg"
                          >
                            <Copy className="w-4 h-4 text-slate-500" />
                          </button>
                          <button
                            onClick={() => deleteWorkflow(workflow.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mb-4">{workflow.description || "No description"}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                        <span>{workflow.steps.length} steps</span>
                        <span>Run {workflow.runCount} times</span>
                      </div>
                      <button
                        onClick={() => selectWorkflow(workflow)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition"
                      >
                        <Play className="w-4 h-4" />
                        Run Workflow
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== RUN HISTORY VIEW ===== */}
        {activeView === "runs" && !selectedWorkflow && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Run History</h2>
                <p className="text-sm text-slate-500">View past and current workflow executions</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {runHistory.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No workflow runs yet</p>
                  <p className="text-sm text-slate-400">Run a workflow to see it here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {runHistory.map(run => (
                    <div key={run.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {run.status === "running" ? (
                            <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                          ) : run.status === "completed" ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : run.status === "failed" ? (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          ) : (
                            <X className="w-5 h-5 text-slate-400" />
                          )}
                          <div>
                            <h4 className="font-medium text-slate-900">{run.workflowName}</h4>
                            <p className="text-xs text-slate-500">
                              Started {run.startedAt.toLocaleString()}
                              {run.completedAt && ` • Completed ${run.completedAt.toLocaleString()}`}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          run.status === "running" ? "bg-violet-100 text-violet-700" :
                          run.status === "completed" ? "bg-green-100 text-green-700" :
                          run.status === "failed" ? "bg-red-100 text-red-700" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                        </span>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span>Progress</span>
                          <span>{run.currentStep} / {run.totalSteps} steps</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              run.status === "running" ? "bg-violet-500" :
                              run.status === "completed" ? "bg-green-500" :
                              "bg-red-500"
                            }`}
                            style={{ width: `${(run.currentStep / run.totalSteps) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== BUILDER VIEW ===== */}
        {activeView === "builder" && !selectedWorkflow && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Workflow Builder</h2>
                <p className="text-sm text-slate-500">Create custom workflows by adding steps</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setBuilderSteps([]);
                    setBuilderName("");
                    setBuilderDescription("");
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50"
                >
                  Clear
                </button>
                <button
                  onClick={saveWorkflow}
                  disabled={!builderName.trim() || builderSteps.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save Workflow
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Step Palette */}
              <div className="w-64 border-r border-slate-200 bg-white p-4 overflow-y-auto">
                <p className="text-sm font-medium text-slate-700 mb-3">Add Steps</p>
                <p className="text-xs text-slate-500 mb-4">Click to add a step to your workflow</p>
                <div className="space-y-2">
                  {Object.entries(STEP_TYPE_CONFIG).map(([type, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => addStepToBuilder(type as StepType)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:shadow-md transition ${getColorClasses(config.color, "bg")} border ${getColorClasses(config.color, "border")}`}
                      >
                        <Icon className={`w-5 h-5 ${getColorClasses(config.color, "text")}`} />
                        <span className="text-sm font-medium text-slate-700">{config.label}</span>
                        <Plus className="w-4 h-4 text-slate-400 ml-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 p-6 bg-slate-100 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-4">
                  {/* Workflow Name & Description */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                    <input
                      type="text"
                      value={builderName}
                      onChange={(e) => setBuilderName(e.target.value)}
                      placeholder="Workflow Name"
                      className="w-full text-lg font-semibold border-none outline-none placeholder-slate-400"
                    />
                    <textarea
                      value={builderDescription}
                      onChange={(e) => setBuilderDescription(e.target.value)}
                      placeholder="Description (optional)"
                      rows={2}
                      className="w-full text-sm border-none outline-none placeholder-slate-400 resize-none"
                    />
                  </div>

                  {/* Steps */}
                  {builderSteps.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center">
                      <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 mb-2">No steps added yet</p>
                      <p className="text-sm text-slate-400">Click on a step type in the left panel to add it</p>
                    </div>
                  ) : (
                    builderSteps.map((step, index) => {
                      const StepIcon = STEP_TYPE_CONFIG[step.type].icon;
                      const color = STEP_TYPE_CONFIG[step.type].color;
                      const isEditing = editingStepId === step.id;

                      return (
                        <div key={step.id}>
                          <div className={`bg-white border rounded-xl transition ${
                            isEditing ? "border-violet-300 ring-2 ring-violet-100" : "border-slate-200"
                          }`}>
                            <div className="flex items-center gap-3 p-4">
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => index > 0 && moveStep(index, index - 1)}
                                  disabled={index === 0}
                                  className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                                >
                                  <ChevronUp className="w-4 h-4 text-slate-400" />
                                </button>
                                <button
                                  onClick={() => index < builderSteps.length - 1 && moveStep(index, index + 1)}
                                  disabled={index === builderSteps.length - 1}
                                  className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                                >
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                </button>
                              </div>

                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(color, "bg")}`}>
                                <StepIcon className={`w-5 h-5 ${getColorClasses(color, "text")}`} />
                              </div>

                              <div className="flex-1">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={step.name}
                                    onChange={(e) => updateBuilderStep(step.id, { name: e.target.value })}
                                    className="w-full font-medium border-b border-violet-300 outline-none pb-1"
                                    autoFocus
                                  />
                                ) : (
                                  <p className="font-medium text-slate-900">{step.name}</p>
                                )}
                                <span className={`text-xs ${getColorClasses(color, "text")}`}>
                                  {STEP_TYPE_CONFIG[step.type].label}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setEditingStepId(isEditing ? null : step.id)}
                                  className="p-2 hover:bg-slate-100 rounded-lg"
                                >
                                  {isEditing ? <Check className="w-4 h-4 text-green-500" /> : <Edit3 className="w-4 h-4 text-slate-400" />}
                                </button>
                                <button
                                  onClick={() => deleteBuilderStep(step.id)}
                                  className="p-2 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>

                            {/* Edit form */}
                            {isEditing && (
                              <div className="border-t border-slate-200 p-4 space-y-3 bg-slate-50">
                                <div>
                                  <label className="block text-xs text-slate-500 mb-1">Description</label>
                                  <textarea
                                    value={step.description}
                                    onChange={(e) => updateBuilderStep(step.id, { description: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                  />
                                </div>

                                {step.type === "input" && (
                                  <>
                                    <div>
                                      <label className="block text-xs text-slate-500 mb-1">Input Type</label>
                                      <select
                                        value={step.config.inputType || "text"}
                                        onChange={(e) => updateBuilderStep(step.id, {
                                          config: { ...step.config, inputType: e.target.value }
                                        })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                      >
                                        <option value="text">Text</option>
                                        <option value="textarea">Long Text</option>
                                        <option value="file">File Upload</option>
                                        <option value="select">Selection</option>
                                      </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={step.config.required !== false}
                                        onChange={(e) => updateBuilderStep(step.id, {
                                          config: { ...step.config, required: e.target.checked }
                                        })}
                                        className="rounded"
                                      />
                                      <label className="text-sm text-slate-600">Required</label>
                                    </div>
                                  </>
                                )}

                                {step.type === "ai-process" && (
                                  <div>
                                    <label className="block text-xs text-slate-500 mb-1">AI Prompt</label>
                                    <textarea
                                      value={step.config.prompt || ""}
                                      onChange={(e) => updateBuilderStep(step.id, {
                                        config: { ...step.config, prompt: e.target.value }
                                      })}
                                      rows={3}
                                      placeholder="Describe what the AI should do..."
                                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    />
                                  </div>
                                )}

                                {step.type === "output" && (
                                  <div>
                                    <label className="block text-xs text-slate-500 mb-1">Output Format</label>
                                    <select
                                      value={step.config.format || "pdf"}
                                      onChange={(e) => updateBuilderStep(step.id, {
                                        config: { ...step.config, format: e.target.value }
                                      })}
                                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    >
                                      <option value="pdf">PDF</option>
                                      <option value="docx">Word Document</option>
                                      <option value="xlsx">Excel</option>
                                      <option value="txt">Plain Text</option>
                                    </select>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Arrow between steps */}
                          {index < builderSteps.length - 1 && (
                            <div className="flex justify-center py-2">
                              <ArrowDown className="w-5 h-5 text-slate-300" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
