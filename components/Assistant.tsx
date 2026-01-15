"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

// Server-side text extraction
async function extractTextFromFile(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/extract-text", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to extract text");
    }

    const data = await response.json();
    return data.text || "[No text extracted]";
  } catch (error) {
    console.error("Error extracting text from file:", error);
    return "[Unable to extract text from file]";
  }
}

import {
  Send,
  Paperclip,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  BookOpen,
  Sparkles,
  Clock,
  Check,
  Copy,
  FileEdit,
  Loader2,
  Plus,
  Trash2,
  MessageSquare,
  Zap,
  Globe,
  Shield,
  Upload,
  Database,
  Scale,
  Building2,
  Landmark,
  FileSearch,
  SkipForward,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

// ===== Types =====
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; excerpt: string; page?: number }[];
  timestamp: Date;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  documents: UploadedDoc[];
  createdAt: Date;
};

type UploadedDoc = {
  id: string;
  name: string;
  size: number;
  type: string;
  file?: File;
};

type KnowledgeSource = {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
};

type DraftType = {
  id: string;
  name: string;
  description: string;
  steps: DraftStep[];
};

type DraftStep = {
  id: string;
  title: string;
  description: string;
  type: "file-upload" | "text-input" | "selection";
  required: boolean;
  skipLabel?: string;
  options?: string[];
};

// ===== Constants =====
const KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  { id: "edgar", name: "EDGAR", icon: Building2, description: "SEC filings and company documents" },
  { id: "legislation", name: "Legislation", icon: Landmark, description: "Federal and state laws" },
  { id: "tax-law", name: "Tax Law", icon: Scale, description: "IRS codes and regulations" },
  { id: "case-law", name: "Case Law", icon: FileSearch, description: "Court decisions and precedents" },
  { id: "regulations", name: "Regulations", icon: Database, description: "Federal and state regulations" },
];

const DRAFT_TYPES: DraftType[] = [
  {
    id: "client-alert",
    name: "Client Alert",
    description: "Create a client alert based on new regulations, opinions, or legal developments",
    steps: [
      {
        id: "source-doc",
        title: "Upload Source Document",
        description: "Upload the opinion, regulation, statute, or other information source that will be the topic of the client alert.",
        type: "file-upload",
        required: true,
      },
      {
        id: "exemplar",
        title: "Upload Exemplar (Optional)",
        description: "Upload a prior client alert that you want to use as an exemplar. The assistant will draft a client alert using the structure, style, and tone of the exemplar document.",
        type: "file-upload",
        required: false,
        skipLabel: "Continue without exemplar",
      },
      {
        id: "additional-context",
        title: "Additional Context",
        description: "Provide any additional context or specific points you'd like to emphasize in the client alert.",
        type: "text-input",
        required: false,
        skipLabel: "Skip and generate draft",
      },
    ],
  },
  {
    id: "contract",
    name: "Contract",
    description: "Draft a new contract or agreement",
    steps: [
      {
        id: "contract-type",
        title: "Select Contract Type",
        description: "What type of contract would you like to draft?",
        type: "selection",
        required: true,
        options: ["NDA", "Service Agreement", "Employment Agreement", "Licensing Agreement", "Partnership Agreement", "Other"],
      },
      {
        id: "template",
        title: "Upload Template (Optional)",
        description: "Upload an existing template or prior contract to use as a starting point.",
        type: "file-upload",
        required: false,
        skipLabel: "Start from scratch",
      },
      {
        id: "key-terms",
        title: "Key Terms",
        description: "Describe the key terms, parties involved, and any specific clauses you need.",
        type: "text-input",
        required: true,
      },
    ],
  },
  {
    id: "memo",
    name: "Legal Memo",
    description: "Draft a legal memorandum or research memo",
    steps: [
      {
        id: "issue",
        title: "Legal Issue",
        description: "Describe the legal issue or question you need to address.",
        type: "text-input",
        required: true,
      },
      {
        id: "research-docs",
        title: "Upload Research Documents",
        description: "Upload any relevant case law, statutes, or research materials.",
        type: "file-upload",
        required: false,
        skipLabel: "I'll rely on AI research",
      },
      {
        id: "audience",
        title: "Select Audience",
        description: "Who is this memo for?",
        type: "selection",
        required: true,
        options: ["Partner/Senior Attorney", "Client", "Court", "Internal Team", "Other"],
      },
    ],
  },
  {
    id: "brief",
    name: "Legal Brief",
    description: "Draft a legal brief or court filing",
    steps: [
      {
        id: "brief-type",
        title: "Brief Type",
        description: "What type of brief are you drafting?",
        type: "selection",
        required: true,
        options: ["Motion to Dismiss", "Summary Judgment", "Appellate Brief", "Response/Opposition", "Reply Brief", "Other"],
      },
      {
        id: "facts",
        title: "Upload Case Documents",
        description: "Upload relevant pleadings, evidence, or case documents.",
        type: "file-upload",
        required: false,
        skipLabel: "Enter facts manually",
      },
      {
        id: "arguments",
        title: "Key Arguments",
        description: "Outline the main arguments and legal theories you want to present.",
        type: "text-input",
        required: true,
      },
    ],
  },
  {
    id: "other",
    name: "Other",
    description: "Draft any other type of legal document",
    steps: [
      {
        id: "document-type",
        title: "Document Type",
        description: "What type of document would you like to draft? Please describe it in detail.",
        type: "text-input",
        required: true,
      },
      {
        id: "reference-docs",
        title: "Upload Reference Documents (Optional)",
        description: "Upload any reference documents, templates, or examples you'd like to use as a starting point.",
        type: "file-upload",
        required: false,
        skipLabel: "Continue without reference documents",
      },
      {
        id: "requirements",
        title: "Requirements & Details",
        description: "Describe the specific requirements, key points, parties involved, and any other details for your document.",
        type: "text-input",
        required: true,
      },
    ],
  },
];

const CAPABILITIES = [
  { icon: MessageSquare, title: "Conversational", desc: "Natural language interaction" },
  { icon: Zap, title: "Agentic Workflows", desc: "Complex multi-step tasks" },
  { icon: Shield, title: "Source Assured", desc: "Cited, reliable answers" },
  { icon: Globe, title: "Multi-language", desc: "50+ languages supported" },
];

const SUGGESTED_PROMPTS = [
  "Summarize the key risks in my uploaded contracts",
  "What are the termination clauses across these documents?",
  "Compare the indemnification terms in these agreements",
  "What governing law applies to each contract?",
  "Explain the implications of this regulation",
];

export default function Assistant() {
  // ===== State =====
  const [activeTab, setActiveTab] = useState<"assist" | "draft">("assist");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [showSources, setShowSources] = useState<string | null>(null);
  const [selectedKnowledgeSources, setSelectedKnowledgeSources] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Draft workflow state
  const [selectedDraftType, setSelectedDraftType] = useState<DraftType | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [draftStepData, setDraftStepData] = useState<Record<string, any>>({});
  const [draftMessages, setDraftMessages] = useState<Message[]>([]);
  const [isDraftGenerating, setIsDraftGenerating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draftFileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  // ===== Effects =====
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, draftMessages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  // ===== Drag & Drop =====
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, forDraft = false) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files, forDraft);
  }, []);

  const processFiles = (files: File[], forDraft = false) => {
    const validFiles = files.filter(f =>
      f.type === "application/pdf" ||
      f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      f.type === "application/msword" ||
      f.type === "text/plain"
    );

    const newDocs: UploadedDoc[] = validFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }));

    if (forDraft && selectedDraftType) {
      const currentStep = selectedDraftType.steps[currentStepIndex];
      setDraftStepData(prev => ({
        ...prev,
        [currentStep.id]: [...(prev[currentStep.id] || []), ...newDocs],
      }));
    } else {
      setUploadedDocs(prev => [...prev, ...newDocs]);
    }
  };

  // ===== Conversation Management =====
  const createNewConversation = () => {
    const newConvo: Conversation = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [],
      documents: [...uploadedDocs],
      createdAt: new Date(),
    };
    setConversations(prev => [newConvo, ...prev]);
    setActiveConversationId(newConvo.id);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    let convoId = activeConversationId;
    if (!convoId) {
      const newConvo: Conversation = {
        id: Date.now().toString(),
        title: input.slice(0, 50) + (input.length > 50 ? "..." : ""),
        messages: [],
        documents: [...uploadedDocs],
        createdAt: new Date(),
      };
      setConversations(prev => [newConvo, ...prev]);
      setActiveConversationId(newConvo.id);
      convoId = newConvo.id;
    }

    // Build display message (what user sees)
    const displayContent = uploadedDocs.length > 0
      ? `${input}\n\n📎 Attached: ${uploadedDocs.map(d => d.name).join(", ")}`
      : input;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: displayContent,
      timestamp: new Date(),
    };

    setConversations(prev => prev.map(c =>
      c.id === convoId
        ? { ...c, messages: [...c.messages, userMessage] }
        : c
    ));

    const currentInput = input;
    const currentDocs = [...uploadedDocs];

    setInput("");
    setUploadedDocs([]); // Clear docs after capturing them
    setIsLoading(true);

    try {
      // Extract text from all uploaded documents
      let documentContents = "";
      if (currentDocs.length > 0) {
        setIsExtracting(true);
        const extractedTexts = await Promise.all(
          currentDocs.map(async (doc) => {
            if (doc.file) {
              const text = await extractTextFromFile(doc.file);
              return `\n\n=== Document: ${doc.name} ===\n${text}`;
            }
            return "";
          })
        );
        documentContents = extractedTexts.join("");
        setIsExtracting(false);
      }

      // Build context-aware message for API (includes actual file contents)
      let apiMessage = currentInput;
      if (documentContents) {
        apiMessage = `The user has uploaded the following document(s) for analysis:\n${documentContents}\n\n---\n\nUser's request: ${currentInput}`;
      }

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: apiMessage,
          conversationId: convoId,
          documents: uploadedDocs.map(d => ({ id: d.id, name: d.name, type: d.type, size: d.size })),
          knowledgeSources: selectedKnowledgeSources,
          draftMode: false,
        }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I apologize, but I encountered an error processing your request.",
        sources: data.sources,
        timestamp: new Date(),
      };

      setConversations(prev => prev.map(c =>
        c.id === convoId
          ? { ...c, messages: [...c.messages, assistantMessage] }
          : c
      ));
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setConversations(prev => prev.map(c =>
        c.id === convoId
          ? { ...c, messages: [...c.messages, errorMessage] }
          : c
      ));
    } finally {
      setIsLoading(false);
      setIsExtracting(false);
    }
  };

  // ===== File Handling =====
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, forDraft = false) => {
    const files = e.target.files;
    if (!files) return;
    processFiles(Array.from(files), forDraft);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (draftFileInputRef.current) draftFileInputRef.current.value = "";
  };

  const removeDoc = (id: string) => {
    setUploadedDocs(prev => prev.filter(d => d.id !== id));
  };

  const removeDraftDoc = (stepId: string, docId: string) => {
    setDraftStepData(prev => ({
      ...prev,
      [stepId]: (prev[stepId] || []).filter((d: UploadedDoc) => d.id !== docId),
    }));
  };

  // ===== Knowledge Source Toggle =====
  const toggleKnowledgeSource = (sourceId: string) => {
    setSelectedKnowledgeSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  // ===== Draft Workflow =====
  const startDraft = (draftType: DraftType) => {
    setSelectedDraftType(draftType);
    setCurrentStepIndex(0);
    setDraftStepData({});
    setDraftMessages([{
      id: Date.now().toString(),
      role: "assistant",
      content: `Let's create your ${draftType.name}. I'll guide you through the process step by step.`,
      timestamp: new Date(),
    }]);
  };

  const handleStepComplete = async (skipStep = false) => {
    if (!selectedDraftType) return;

    const currentStep = selectedDraftType.steps[currentStepIndex];

    // Add user message showing what they provided
    if (!skipStep && draftStepData[currentStep.id]) {
      const stepValue = draftStepData[currentStep.id];
      let content = "";
      if (currentStep.type === "file-upload" && Array.isArray(stepValue)) {
        content = `Uploaded: ${stepValue.map((d: UploadedDoc) => d.name).join(", ")}`;
      } else if (currentStep.type === "text-input") {
        content = stepValue;
      } else if (currentStep.type === "selection") {
        content = `Selected: ${stepValue}`;
      }

      if (content) {
        setDraftMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "user",
          content,
          timestamp: new Date(),
        }]);
      }
    } else if (skipStep) {
      setDraftMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "user",
        content: `Skipped: ${currentStep.title}`,
        timestamp: new Date(),
      }]);
    }

    // Check if there are more steps
    if (currentStepIndex < selectedDraftType.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      const nextStep = selectedDraftType.steps[currentStepIndex + 1];

      // Add assistant message for next step
      setTimeout(() => {
        setDraftMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: nextStep.description,
          timestamp: new Date(),
        }]);
      }, 300);
    } else {
      // All steps complete - generate draft
      await generateDraft();
    }
  };

  const generateDraft = async () => {
    if (!selectedDraftType) return;

    setIsDraftGenerating(true);
    setDraftMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: "assistant",
      content: "Generating your draft based on the information provided...",
      timestamp: new Date(),
    }]);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Generate a ${selectedDraftType.name} based on the following inputs: ${JSON.stringify(draftStepData)}`,
          draftMode: true,
          draftType: selectedDraftType.id,
          draftData: draftStepData,
        }),
      });

      const data = await res.json();

      setDraftMessages(prev => [
        ...prev.slice(0, -1), // Remove "generating" message
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response || "Here is your generated draft:\n\n[Draft content would appear here]",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setDraftMessages(prev => [
        ...prev.slice(0, -1),
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I apologize, but I encountered an error generating your draft. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsDraftGenerating(false);
    }
  };

  const resetDraft = () => {
    setSelectedDraftType(null);
    setCurrentStepIndex(0);
    setDraftStepData({});
    setDraftMessages([]);
  };

  // ===== Utilities =====
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // ===== Render Current Draft Step =====
  const renderDraftStep = () => {
    if (!selectedDraftType) return null;
    const currentStep = selectedDraftType.steps[currentStepIndex];
    const stepData = draftStepData[currentStep.id];

    return (
      <div className="p-4 border border-slate-200 rounded-xl bg-white">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
            {currentStepIndex + 1}
          </div>
          <h4 className="font-medium text-slate-900">{currentStep.title}</h4>
          {!currentStep.required && (
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Optional</span>
          )}
        </div>

        {currentStep.type === "file-upload" && (
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, true)}
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 mb-2">
              Drag & drop files here, or{" "}
              <button
                onClick={() => draftFileInputRef.current?.click()}
                className="text-blue-600 hover:underline"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-slate-400">PDF, DOCX, DOC, or TXT</p>
            <input
              ref={draftFileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              onChange={(e) => handleFileUpload(e, true)}
            />

            {/* Uploaded files for this step */}
            {stepData && Array.isArray(stepData) && stepData.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {stepData.map((doc: UploadedDoc) => (
                  <div key={doc.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700 max-w-[150px] truncate">{doc.name}</span>
                    <button onClick={() => removeDraftDoc(currentStep.id, doc.id)} className="text-slate-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep.type === "text-input" && (
          <textarea
            value={stepData || ""}
            onChange={(e) => setDraftStepData(prev => ({ ...prev, [currentStep.id]: e.target.value }))}
            placeholder="Enter your response..."
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        )}

        {currentStep.type === "selection" && currentStep.options && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {currentStep.options.map((option) => (
              <button
                key={option}
                onClick={() => setDraftStepData(prev => ({ ...prev, [currentStep.id]: option }))}
                className={`px-4 py-2 rounded-lg border text-sm transition ${
                  stepData === option
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-4">
          <div>
            {!currentStep.required && currentStep.skipLabel && (
              <button
                onClick={() => handleStepComplete(true)}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
              >
                <SkipForward className="w-4 h-4" />
                {currentStep.skipLabel}
              </button>
            )}
          </div>
          <button
            onClick={() => handleStepComplete(false)}
            disabled={currentStep.required && !stepData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStepIndex < selectedDraftType.steps.length - 1 ? "Continue" : "Generate Draft"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // ===== Main Render =====
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Conversation History */}
      <div className={`${showHistory ? 'w-72' : 'w-0'} transition-all duration-300 border-r border-slate-200 bg-white flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-slate-200">
          <button
            onClick={createNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No conversations yet</p>
          ) : (
            conversations.map(convo => (
              <div
                key={convo.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${
                  activeConversationId === convo.id
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
                onClick={() => setActiveConversationId(convo.id)}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-sm truncate">{convo.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(convo.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition"
                >
                  <Trash2 className="w-3 h-3 text-slate-500" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Tabs Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-slate-100 rounded-lg transition mr-2"
            >
              <MessageSquare className="w-5 h-5 text-slate-600" />
            </button>

            {/* Tabs */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("assist")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === "assist"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Assist
              </button>
              <button
                onClick={() => setActiveTab("draft")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === "draft"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileEdit className="w-4 h-4" />
                Draft
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-900">
              {activeTab === "assist" ? "Legal Assistant" : "Document Drafting"}
            </h2>
          </div>
        </div>

        {/* ===== ASSIST TAB ===== */}
        {activeTab === "assist" && (
          <>
            {/* Knowledge Sources Bar */}
            <div className="px-6 py-3 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 whitespace-nowrap">Knowledge Sources:</span>
                <div className="flex flex-wrap gap-2">
                  {KNOWLEDGE_SOURCES.map((source) => {
                    const Icon = source.icon;
                    const isSelected = selectedKnowledgeSources.includes(source.id);
                    return (
                      <button
                        key={source.id}
                        onClick={() => toggleKnowledgeSource(source.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                          isSelected
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "bg-slate-100 text-slate-600 border border-transparent hover:bg-slate-200"
                        }`}
                        title={source.description}
                      >
                        <Icon className="w-4 h-4" />
                        {source.name}
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
                onChange={(e) => handleFileUpload(e, false)}
              />
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-2">How can I help you today?</h3>
                  <p className="text-slate-500 text-center max-w-md mb-8">
                    I can analyze contracts, answer legal questions, and research across your selected knowledge sources.
                  </p>

                  {/* Capabilities */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl">
                    {CAPABILITIES.map((cap, i) => (
                      <div key={i} className="flex flex-col items-center p-4 bg-white rounded-xl border border-slate-200">
                        <cap.icon className="w-6 h-6 text-blue-600 mb-2" />
                        <p className="text-sm font-medium text-slate-900">{cap.title}</p>
                        <p className="text-xs text-slate-500 text-center">{cap.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Suggested Prompts */}
                  <div className="w-full max-w-2xl">
                    <p className="text-sm text-slate-500 mb-3">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_PROMPTS.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(prompt)}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-6 max-w-4xl mx-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 overflow-hidden ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white max-w-2xl"
                            : "bg-white border border-slate-200 text-slate-900 w-full"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        ) : (
                          <div className="prose prose-slate prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-semibold prose-h2:text-lg prose-h2:mt-4 prose-h2:mb-2 prose-h3:text-base prose-h3:mt-3 prose-h3:mb-1 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-table:my-3 prose-table:w-full prose-th:bg-slate-100 prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-td:border prose-th:border prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-1 prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-code:break-all prose-strong:text-slate-900 prose-pre:overflow-x-auto break-words">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        )}

                        {/* Sources */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <button
                              onClick={() => setShowSources(showSources === msg.id ? null : msg.id)}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                              <BookOpen className="w-4 h-4" />
                              {msg.sources.length} source{msg.sources.length > 1 ? "s" : ""}
                              {showSources === msg.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {showSources === msg.id && (
                              <div className="mt-2 space-y-2">
                                {msg.sources.map((src, i) => (
                                  <div key={i} className="p-2 bg-slate-50 rounded-lg text-sm">
                                    <p className="font-medium text-slate-700">{src.title}</p>
                                    {src.page && <p className="text-xs text-slate-500">Page {src.page}</p>}
                                    <p className="text-slate-600 mt-1">{src.excerpt}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        {msg.role === "assistant" && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2">
                            <button
                              onClick={() => copyToClipboard(msg.content)}
                              className="p-1 text-slate-400 hover:text-slate-600 transition"
                              title="Copy"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-slate-500">
                          {isExtracting ? "Extracting text from documents..." : "Analyzing and generating response..."}
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area with Drag & Drop */}
            <div
              className={`p-4 border-t border-slate-200 bg-white transition ${
                isDragging ? "bg-blue-50" : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, false)}
            >
              <div className="max-w-4xl mx-auto">
                {/* Drag overlay indicator */}
                {isDragging && (
                  <div className="mb-3 p-4 border-2 border-dashed border-blue-400 rounded-xl bg-blue-50 text-center">
                    <Upload className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-sm text-blue-600 font-medium">Drop files here</p>
                  </div>
                )}

                {/* Attached Files Display */}
                {uploadedDocs.length > 0 && (
                  <div className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Paperclip className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-medium text-slate-600">
                        {uploadedDocs.length} file{uploadedDocs.length > 1 ? "s" : ""} attached
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {uploadedDocs.map(doc => (
                        <div key={doc.id} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm group">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-slate-700 max-w-[150px] truncate">{doc.name}</span>
                          <span className="text-slate-400 text-xs">{formatFileSize(doc.size)}</span>
                          <button
                            onClick={() => removeDoc(doc.id)}
                            className="text-slate-400 hover:text-red-500 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`flex items-end gap-3 rounded-2xl border p-3 transition ${
                  isDragging
                    ? "bg-blue-50 border-blue-300"
                    : "bg-slate-50 border-slate-200"
                }`}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
                    title="Attach documents (PDF, DOCX, DOC, TXT)"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={uploadedDocs.length > 0
                      ? "Ask about your attached files..."
                      : "Ask me anything about your contracts... (drag & drop files here)"
                    }
                    className="flex-1 bg-transparent border-none outline-none resize-none text-slate-900 placeholder-slate-400 text-sm min-h-[24px] max-h-[200px]"
                    rows={1}
                  />

                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 text-center mt-2">
                  Press Enter to send • Drag & drop or click <Paperclip className="w-3 h-3 inline" /> to attach files
                </p>
              </div>
            </div>
          </>
        )}

        {/* ===== DRAFT TAB ===== */}
        {activeTab === "draft" && (
          <>
            {!selectedDraftType ? (
              /* Draft Type Selection */
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileEdit className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-2">What would you like to draft?</h3>
                    <p className="text-slate-500">
                      Select a document type below and I'll guide you through the drafting process step by step.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DRAFT_TYPES.map((draftType) => (
                      <button
                        key={draftType.id}
                        onClick={() => startDraft(draftType)}
                        className="flex flex-col items-start p-6 bg-white border border-slate-200 rounded-2xl hover:border-purple-300 hover:shadow-md transition text-left group"
                      >
                        <div className="flex items-center justify-between w-full mb-3">
                          <h4 className="text-lg font-semibold text-slate-900 group-hover:text-purple-600">
                            {draftType.name}
                          </h4>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600" />
                        </div>
                        <p className="text-sm text-slate-500">{draftType.description}</p>
                        <p className="text-xs text-slate-400 mt-2">{draftType.steps.length} steps</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Guided Draft Workflow */
              <div className="flex-1 flex flex-col">
                {/* Progress indicator */}
                <div className="px-6 py-3 border-b border-slate-200 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={resetDraft}
                        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Start Over
                      </button>
                    </div>
                    <span className="text-sm text-slate-500">
                      {selectedDraftType.name} • Step {currentStepIndex + 1} of {selectedDraftType.steps.length}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {selectedDraftType.steps.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 flex-1 rounded-full transition ${
                          idx < currentStepIndex
                            ? "bg-purple-600"
                            : idx === currentStepIndex
                            ? "bg-purple-400"
                            : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Draft conversation */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
                  <div className="max-w-4xl mx-auto space-y-4">
                    {draftMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-3 overflow-hidden ${
                            msg.role === "user"
                              ? "bg-purple-600 text-white max-w-2xl"
                              : "bg-white border border-slate-200 text-slate-900 w-full"
                          }`}
                        >
                          {msg.role === "user" ? (
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          ) : (
                            <div className="prose prose-slate prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-semibold prose-h2:text-lg prose-h2:mt-4 prose-h2:mb-2 prose-h3:text-base prose-h3:mt-3 prose-h3:mb-1 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-table:my-3 prose-table:w-full prose-table:overflow-x-auto prose-th:bg-slate-100 prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-td:border prose-th:border prose-blockquote:border-l-purple-500 prose-blockquote:bg-purple-50 prose-blockquote:py-1 prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-code:break-all prose-strong:text-slate-900 prose-pre:overflow-x-auto break-words">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          )}
                          {msg.role === "assistant" && (
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2">
                              <button
                                onClick={() => copyToClipboard(msg.content)}
                                className="p-1 text-slate-400 hover:text-slate-600 transition"
                                title="Copy"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Current step input */}
                    {!isDraftGenerating && currentStepIndex < selectedDraftType.steps.length && (
                      <div className="mt-4">
                        {renderDraftStep()}
                      </div>
                    )}

                    {isDraftGenerating && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                          <span className="text-slate-500">Generating your draft...</span>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
