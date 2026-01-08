"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  FolderOpen,
  FileText,
  Upload,
  Search,
  Filter,
  MoreVertical,
  Plus,
  Trash2,
  Download,
  Share2,
  Eye,
  Edit3,
  ChevronRight,
  ChevronDown,
  Users,
  Lock,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Settings,
  Sparkles,
  Database,
  BarChart3,
  FileSearch,
  Copy,
  ExternalLink,
  RefreshCw,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Calendar,
  Tag,
  Building2,
} from "lucide-react";

// ===== Types =====
type VaultFolder = {
  id: string;
  name: string;
  description?: string;
  documentCount: number;
  sharedWith: SharedUser[];
  createdAt: Date;
  updatedAt: Date;
  isExpanded?: boolean;
  subfolders?: VaultFolder[];
};

type VaultDocument = {
  id: string;
  name: string;
  type: string;
  size: number;
  folderId: string;
  uploadedAt: Date;
  analyzedAt?: Date;
  status: "pending" | "analyzing" | "analyzed" | "error";
  extractedFields?: ExtractedField[];
  tags?: string[];
  uploadedBy: string;
};

type ExtractedField = {
  name: string;
  value: string;
  confidence: number;
  category: string;
};

type SharedUser = {
  id: string;
  name: string;
  email: string;
  permission: "view" | "edit" | "admin";
  avatar?: string;
};

type Integration = {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  connected: boolean;
  lastSync?: Date;
};

// ===== Constants =====
const INTEGRATIONS: Integration[] = [
  { id: "sharepoint", name: "SharePoint", icon: Building2, connected: false },
  { id: "google-drive", name: "Google Drive", icon: Database, connected: false },
  { id: "dropbox", name: "Dropbox", icon: Database, connected: false },
  { id: "box", name: "Box", icon: Database, connected: false },
];

const SAMPLE_EXTRACTED_FIELDS: ExtractedField[] = [
  { name: "Contract Type", value: "Master Services Agreement", confidence: 98, category: "General" },
  { name: "Effective Date", value: "January 1, 2024", confidence: 99, category: "Dates" },
  { name: "Expiration Date", value: "December 31, 2026", confidence: 97, category: "Dates" },
  { name: "Governing Law", value: "State of Delaware", confidence: 96, category: "Legal" },
  { name: "Liability Cap", value: "$1,000,000", confidence: 94, category: "Financial" },
  { name: "Payment Terms", value: "Net 30", confidence: 95, category: "Financial" },
  { name: "Termination Notice", value: "30 days written notice", confidence: 93, category: "Terms" },
  { name: "Auto-Renewal", value: "Yes, 1 year terms", confidence: 92, category: "Terms" },
  { name: "Party A", value: "Acme Corporation", confidence: 99, category: "Parties" },
  { name: "Party B", value: "XYZ Industries LLC", confidence: 99, category: "Parties" },
];

export default function Vault() {
  // ===== State =====
  const [folders, setFolders] = useState<VaultFolder[]>([
    {
      id: "1",
      name: "Active Contracts",
      description: "Current active agreements and contracts",
      documentCount: 156,
      sharedWith: [
        { id: "u1", name: "John Smith", email: "john@company.com", permission: "edit" },
        { id: "u2", name: "Sarah Lee", email: "sarah@company.com", permission: "view" },
      ],
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-12-20"),
      isExpanded: true,
    },
    {
      id: "2",
      name: "M&A Documents",
      description: "Merger and acquisition related documents",
      documentCount: 89,
      sharedWith: [
        { id: "u1", name: "John Smith", email: "john@company.com", permission: "admin" },
      ],
      createdAt: new Date("2024-03-10"),
      updatedAt: new Date("2024-12-18"),
    },
    {
      id: "3",
      name: "NDAs",
      description: "Non-disclosure agreements",
      documentCount: 234,
      sharedWith: [],
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-12-15"),
    },
    {
      id: "4",
      name: "Employment Agreements",
      description: "Employee contracts and agreements",
      documentCount: 78,
      sharedWith: [
        { id: "u3", name: "HR Team", email: "hr@company.com", permission: "edit" },
      ],
      createdAt: new Date("2024-04-20"),
      updatedAt: new Date("2024-12-10"),
    },
  ]);

  const [documents, setDocuments] = useState<VaultDocument[]>([
    {
      id: "d1",
      name: "Master Services Agreement - Acme Corp.pdf",
      type: "application/pdf",
      size: 2456000,
      folderId: "1",
      uploadedAt: new Date("2024-12-15"),
      analyzedAt: new Date("2024-12-15"),
      status: "analyzed",
      extractedFields: SAMPLE_EXTRACTED_FIELDS,
      tags: ["MSA", "Acme", "2024"],
      uploadedBy: "John Smith",
    },
    {
      id: "d2",
      name: "NDA - XYZ Industries.docx",
      type: "application/docx",
      size: 156000,
      folderId: "1",
      uploadedAt: new Date("2024-12-18"),
      analyzedAt: new Date("2024-12-18"),
      status: "analyzed",
      extractedFields: SAMPLE_EXTRACTED_FIELDS.slice(0, 6),
      tags: ["NDA", "XYZ"],
      uploadedBy: "Sarah Lee",
    },
    {
      id: "d3",
      name: "Vendor Agreement - Tech Solutions.pdf",
      type: "application/pdf",
      size: 890000,
      folderId: "1",
      uploadedAt: new Date("2024-12-20"),
      status: "analyzing",
      uploadedBy: "John Smith",
    },
    {
      id: "d4",
      name: "Employment Contract - New Hire.pdf",
      type: "application/pdf",
      size: 345000,
      folderId: "1",
      uploadedAt: new Date("2024-12-21"),
      status: "pending",
      uploadedBy: "HR Team",
    },
  ]);

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>("1");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [bulkAnalyzing, setBulkAnalyzing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== Computed Values =====
  const selectedFolder = folders.find(f => f.id === selectedFolderId);
  const selectedDocument = documents.find(d => d.id === selectedDocumentId);

  const filteredDocuments = documents
    .filter(d => d.folderId === selectedFolderId)
    .filter(d =>
      searchQuery === "" ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") comparison = a.name.localeCompare(b.name);
      else if (sortBy === "date") comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
      else if (sortBy === "size") comparison = a.size - b.size;
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const totalDocuments = folders.reduce((sum, f) => sum + f.documentCount, 0);
  const analyzedCount = documents.filter(d => d.status === "analyzed").length;

  // ===== Handlers =====
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [selectedFolderId]);

  const handleFiles = async (files: File[]) => {
    if (!selectedFolderId) return;
    setIsUploading(true);

    const newDocs: VaultDocument[] = files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      folderId: selectedFolderId,
      uploadedAt: new Date(),
      status: "pending" as const,
      uploadedBy: "You",
    }));

    setDocuments(prev => [...newDocs, ...prev]);

    // Simulate upload and analysis
    for (const doc of newDocs) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDocuments(prev => prev.map(d =>
        d.id === doc.id ? { ...d, status: "analyzing" as const } : d
      ));

      await new Promise(resolve => setTimeout(resolve, 2000));
      setDocuments(prev => prev.map(d =>
        d.id === doc.id ? {
          ...d,
          status: "analyzed" as const,
          analyzedAt: new Date(),
          extractedFields: SAMPLE_EXTRACTED_FIELDS,
        } : d
      ));
    }

    // Update folder count
    setFolders(prev => prev.map(f =>
      f.id === selectedFolderId
        ? { ...f, documentCount: f.documentCount + files.length, updatedAt: new Date() }
        : f
    ));

    setIsUploading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) handleFiles(Array.from(files));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: VaultFolder = {
      id: Date.now().toString(),
      name: newFolderName,
      description: newFolderDescription,
      documentCount: 0,
      sharedWith: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setFolders(prev => [...prev, newFolder]);
    setNewFolderName("");
    setNewFolderDescription("");
    setShowNewFolderModal(false);
  };

  const deleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    if (selectedDocumentId === docId) setSelectedDocumentId(null);
  };

  const deleteFolder = (folderId: string) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
    setDocuments(prev => prev.filter(d => d.folderId !== folderId));
    if (selectedFolderId === folderId) setSelectedFolderId(null);
  };

  const runBulkAnalysis = async () => {
    setBulkAnalyzing(true);
    const pendingDocs = documents.filter(d => d.status === "pending");

    for (const doc of pendingDocs) {
      setDocuments(prev => prev.map(d =>
        d.id === doc.id ? { ...d, status: "analyzing" as const } : d
      ));
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDocuments(prev => prev.map(d =>
        d.id === doc.id ? {
          ...d,
          status: "analyzed" as const,
          analyzedAt: new Date(),
          extractedFields: SAMPLE_EXTRACTED_FIELDS,
        } : d
      ));
    }

    setBulkAnalyzing(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getStatusBadge = (status: VaultDocument["status"]) => {
    switch (status) {
      case "analyzed":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
            <CheckCircle2 className="w-3 h-3" /> Analyzed
          </span>
        );
      case "analyzing":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
            <Loader2 className="w-3 h-3 animate-spin" /> Analyzing
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case "error":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
            <AlertCircle className="w-3 h-3" /> Error
          </span>
        );
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return "text-green-600 bg-green-100";
    if (confidence >= 85) return "text-blue-600 bg-blue-100";
    if (confidence >= 70) return "text-amber-600 bg-amber-100";
    return "text-red-600 bg-red-100";
  };

  // ===== Render =====
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Folders */}
      <div className="w-72 border-r border-slate-200 bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-slate-900">Vault</h1>
            </div>
            <button
              onClick={() => setShowIntegrations(true)}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
              title="Integrations"
            >
              <Settings className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-slate-50 rounded-lg">
              <p className="text-lg font-semibold text-slate-900">{totalDocuments.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Documents</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <p className="text-lg font-semibold text-slate-900">{folders.length}</p>
              <p className="text-xs text-slate-500">Vaults</p>
            </div>
          </div>
        </div>

        {/* New Folder Button */}
        <div className="p-3 border-b border-slate-200">
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            New Vault
          </button>
        </div>

        {/* Folder List */}
        <div className="flex-1 overflow-y-auto p-2">
          {folders.map(folder => (
            <div
              key={folder.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition mb-1 ${
                selectedFolderId === folder.id
                  ? "bg-indigo-50 text-indigo-700"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
              onClick={() => {
                setSelectedFolderId(folder.id);
                setSelectedDocumentId(null);
              }}
            >
              <FolderOpen className={`w-5 h-5 flex-shrink-0 ${
                selectedFolderId === folder.id ? "text-indigo-600" : "text-slate-400"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{folder.name}</p>
                <p className="text-xs text-slate-500">{folder.documentCount} documents</p>
              </div>
              {folder.sharedWith.length > 0 && (
                <Users className="w-4 h-4 text-slate-400" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Delete this vault and all its documents?")) {
                    deleteFolder(folder.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition"
              >
                <Trash2 className="w-3 h-3 text-slate-500" />
              </button>
            </div>
          ))}
        </div>

        {/* Storage Info */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-500">Storage Used</span>
            <span className="font-medium text-slate-900">2.4 GB / 10 GB</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full w-[24%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {selectedFolder?.name || "Select a Vault"}
            </h2>
            {selectedFolder && (
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {/* View Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
              >
                <List className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
              >
                <Grid3X3 className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split("-");
                setSortBy(by as any);
                setSortOrder(order as any);
              }}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="size-desc">Largest First</option>
              <option value="size-asc">Smallest First</option>
            </select>

            {/* Bulk Analyze */}
            <button
              onClick={runBulkAnalysis}
              disabled={bulkAnalyzing || !documents.some(d => d.status === "pending")}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {bulkAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Analyze All
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Documents List/Grid */}
          <div className={`flex-1 overflow-y-auto p-6 ${selectedDocumentId ? "w-1/2" : ""}`}>
            {selectedFolderId ? (
              <>
                {/* Upload Drop Zone */}
                <div
                  className={`mb-6 border-2 border-dashed rounded-2xl p-8 text-center transition ${
                    isDragging
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? "text-indigo-500" : "text-slate-400"}`} />
                  <p className="text-sm text-slate-600 mb-2">
                    Drag & drop files here, or{" "}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-indigo-600 hover:underline font-medium"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-slate-400">
                    PDF, DOCX, DOC, TXT • Up to 100MB per file
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.txt"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  {isUploading && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-indigo-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Uploading and analyzing...</span>
                    </div>
                  )}
                </div>

                {/* Documents */}
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No documents yet</p>
                    <p className="text-sm text-slate-400">Upload documents to get started</p>
                  </div>
                ) : viewMode === "list" ? (
                  <div className="space-y-2">
                    {filteredDocuments.map(doc => (
                      <div
                        key={doc.id}
                        className={`flex items-center gap-4 p-4 bg-white border rounded-xl cursor-pointer transition hover:shadow-md ${
                          selectedDocumentId === doc.id ? "border-indigo-300 ring-2 ring-indigo-100" : "border-slate-200"
                        }`}
                        onClick={() => setSelectedDocumentId(doc.id)}
                      >
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{doc.name}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span>{formatFileSize(doc.size)}</span>
                            <span>•</span>
                            <span>{doc.uploadedAt.toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{doc.uploadedBy}</span>
                          </div>
                        </div>
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex gap-1">
                            {doc.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {getStatusBadge(doc.status)}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDocument(doc.id);
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredDocuments.map(doc => (
                      <div
                        key={doc.id}
                        className={`p-4 bg-white border rounded-xl cursor-pointer transition hover:shadow-md ${
                          selectedDocumentId === doc.id ? "border-indigo-300 ring-2 ring-indigo-100" : "border-slate-200"
                        }`}
                        onClick={() => setSelectedDocumentId(doc.id)}
                      >
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                          <FileText className="w-6 h-6 text-slate-500" />
                        </div>
                        <p className="font-medium text-slate-900 text-sm truncate mb-1">{doc.name}</p>
                        <p className="text-xs text-slate-500 mb-2">{formatFileSize(doc.size)}</p>
                        {getStatusBadge(doc.status)}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-lg text-slate-500 mb-2">Select a vault to view documents</p>
                  <p className="text-sm text-slate-400">Or create a new vault to get started</p>
                </div>
              </div>
            )}
          </div>

          {/* Document Details Panel */}
          {selectedDocument && (
            <div className="w-1/2 border-l border-slate-200 bg-white overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{selectedDocument.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span>{formatFileSize(selectedDocument.size)}</span>
                      <span>•</span>
                      <span>{selectedDocument.uploadedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDocumentId(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {/* Status */}
                <div className="mb-6">
                  {getStatusBadge(selectedDocument.status)}
                  {selectedDocument.analyzedAt && (
                    <p className="text-xs text-slate-500 mt-2">
                      Analyzed on {selectedDocument.analyzedAt.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mb-6">
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>

                {/* Tags */}
                {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm">
                          {tag}
                        </span>
                      ))}
                      <button className="px-3 py-1 border border-dashed border-slate-300 text-slate-500 rounded-lg text-sm hover:border-slate-400">
                        + Add Tag
                      </button>
                    </div>
                  </div>
                )}

                {/* Extracted Fields */}
                {selectedDocument.status === "analyzed" && selectedDocument.extractedFields && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-slate-700">Extracted Fields</h4>
                      <span className="text-xs text-slate-500">
                        {selectedDocument.extractedFields.length} fields • 97% avg. confidence
                      </span>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(
                        selectedDocument.extractedFields.reduce((acc, field) => {
                          if (!acc[field.category]) acc[field.category] = [];
                          acc[field.category].push(field);
                          return acc;
                        }, {} as Record<string, ExtractedField[]>)
                      ).map(([category, fields]) => (
                        <div key={category} className="border border-slate-200 rounded-xl overflow-hidden">
                          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                            <h5 className="text-sm font-medium text-slate-700">{category}</h5>
                          </div>
                          <div className="divide-y divide-slate-100">
                            {fields.map((field, idx) => (
                              <div key={idx} className="flex items-center justify-between px-4 py-3">
                                <div>
                                  <p className="text-sm text-slate-500">{field.name}</p>
                                  <p className="text-sm font-medium text-slate-900">{field.value}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getConfidenceColor(field.confidence)}`}>
                                  {field.confidence}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDocument.status === "analyzing" && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
                      <p className="text-slate-600">Analyzing document...</p>
                      <p className="text-sm text-slate-400">Extracting fields and insights</p>
                    </div>
                  </div>
                )}

                {selectedDocument.status === "pending" && (
                  <div className="text-center py-12">
                    <Clock className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                    <p className="text-slate-600">Pending Analysis</p>
                    <p className="text-sm text-slate-400 mb-4">Click "Analyze All" to process this document</p>
                    <button
                      onClick={() => {
                        setDocuments(prev => prev.map(d =>
                          d.id === selectedDocument.id ? { ...d, status: "analyzing" as const } : d
                        ));
                        setTimeout(() => {
                          setDocuments(prev => prev.map(d =>
                            d.id === selectedDocument.id ? {
                              ...d,
                              status: "analyzed" as const,
                              analyzedAt: new Date(),
                              extractedFields: SAMPLE_EXTRACTED_FIELDS,
                            } : d
                          ));
                        }, 2000);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Analyze Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Vault</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vault Name</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g., Client Contracts 2024"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  placeholder="Brief description of this vault..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                disabled={!newFolderName.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                Create Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Share "{selectedFolder.name}"</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Invite by email</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <select className="px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200">
                  <option value="view">View</option>
                  <option value="edit">Edit</option>
                  <option value="admin">Admin</option>
                </select>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
                  Invite
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-slate-700 mb-2">People with access</p>
              {selectedFolder.sharedWith.length === 0 ? (
                <p className="text-sm text-slate-500">Only you have access to this vault</p>
              ) : (
                <div className="space-y-2">
                  {selectedFolder.sharedWith.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium text-sm">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 capitalize">{user.permission}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Integrations Modal */}
      {showIntegrations && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Integrations</h3>
              <button
                onClick={() => setShowIntegrations(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Connect your cloud storage to automatically sync documents to your vault.
            </p>

            <div className="space-y-3">
              {INTEGRATIONS.map(integration => {
                const Icon = integration.icon;
                return (
                  <div key={integration.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{integration.name}</p>
                        {integration.connected ? (
                          <p className="text-xs text-green-600">Connected • Last sync: 2 hours ago</p>
                        ) : (
                          <p className="text-xs text-slate-500">Not connected</p>
                        )}
                      </div>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-lg text-sm transition ${
                        integration.connected
                          ? "border border-slate-200 text-slate-700 hover:bg-slate-50"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {integration.connected ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
