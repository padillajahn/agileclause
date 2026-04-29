"use client";

import React from "react";
import {
  ShieldAlert,
  FileSignature,
  Handshake,
  Gavel,
  Plus,
  Trash2,
} from "lucide-react";
import { PageHero, SectionHeader } from "../ui/SectionHeader";
import { Card, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { MetricCard } from "../ui/MetricCard";
import type { PlaybookCategory, PlaybookRule } from "./types";

const RULES_STORAGE_KEY = "agileclause.playbookRules.v2";

const STARTER_RULES: PlaybookRule[] = [
  {
    id: "starter-1",
    text: "Flag uncapped indemnity.",
    category: "Risk Rules",
    createdAt: new Date().toISOString(),
  },
  {
    id: "starter-2",
    text: "Flag auto-renewal clauses longer than 12 months.",
    category: "Risk Rules",
    createdAt: new Date().toISOString(),
  },
  {
    id: "starter-3",
    text: "Require mutual confidentiality with a 3-year survival.",
    category: "Preferred Clauses",
    createdAt: new Date().toISOString(),
  },
  {
    id: "starter-4",
    text: "Liability cap at 1x fees paid in the prior 12 months.",
    category: "Negotiation Standards",
    createdAt: new Date().toISOString(),
  },
  {
    id: "starter-5",
    text: "Prefer New York governing law and venue.",
    category: "Negotiation Standards",
    createdAt: new Date().toISOString(),
  },
  {
    id: "starter-6",
    text: "Require SOC 2 Type II audit rights for vendors handling PII.",
    category: "Compliance Checks",
    createdAt: new Date().toISOString(),
  },
];

const CATEGORIES: {
  id: PlaybookCategory;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "Risk Rules",
    label: "Risk rules",
    description: "Hard stops the agent should always flag.",
    icon: ShieldAlert,
  },
  {
    id: "Preferred Clauses",
    label: "Preferred clauses",
    description: "Clause shapes you want to see in every contract.",
    icon: FileSignature,
  },
  {
    id: "Negotiation Standards",
    label: "Negotiation standards",
    description: "Default redlines and counter-positions.",
    icon: Handshake,
  },
  {
    id: "Compliance Checks",
    label: "Compliance checks",
    description: "Obligations the agent must verify.",
    icon: Gavel,
  },
];

export default function PlaybooksPage() {
  const [rules, setRules] = React.useState<PlaybookRule[]>([]);
  const [activeCategory, setActiveCategory] = React.useState<PlaybookCategory>("Risk Rules");
  const [newRuleText, setNewRuleText] = React.useState("");

  // Load rules
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(RULES_STORAGE_KEY);
      if (raw) {
        setRules(JSON.parse(raw));
      } else {
        setRules(STARTER_RULES);
        localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(STARTER_RULES));
      }
    } catch {
      setRules(STARTER_RULES);
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
    } catch {
      // ignore
    }
  }, [rules]);

  function addRule() {
    if (!newRuleText.trim()) return;
    const rule: PlaybookRule = {
      id: crypto.randomUUID(),
      text: newRuleText.trim(),
      category: activeCategory,
      createdAt: new Date().toISOString(),
    };
    setRules((prev) => [rule, ...prev]);
    setNewRuleText("");
  }

  function removeRule(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  const counts: Record<PlaybookCategory, number> = {
    "Risk Rules": rules.filter((r) => r.category === "Risk Rules").length,
    "Preferred Clauses": rules.filter((r) => r.category === "Preferred Clauses").length,
    "Negotiation Standards": rules.filter((r) => r.category === "Negotiation Standards").length,
    "Compliance Checks": rules.filter((r) => r.category === "Compliance Checks").length,
  };

  const activeRules = rules.filter((r) => r.category === activeCategory);

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Playbooks"
        title="Firm Standards"
        description="Encode your firm's preferred terms, redlines, and compliance obligations. The agent uses these to guide every review."
      />

      {/* Metric strip */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <MetricCard
            key={cat.id}
            label={cat.label}
            value={counts[cat.id]}
            hint={counts[cat.id] === 1 ? "active rule" : "active rules"}
            icon={cat.icon}
          />
        ))}
      </div>

      {/* Category tabs */}
      <div>
        <SectionHeader
          eyebrow="Categories"
          title="Manage rules"
          description="Switch between categories to add or remove rules."
          className="mb-4"
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`group rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white shadow-[0_8px_24px_-8px_rgba(15,23,42,0.25)]"
                    : "border-slate-200/80 bg-white hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(15,23,42,0.1)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      active
                        ? "bg-white/10 ring-1 ring-white/15 text-amber-200"
                        : "bg-slate-50 ring-1 ring-slate-200/80 text-slate-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      active ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {counts[cat.id]}
                  </span>
                </div>
                <p
                  className={`mt-3 text-sm font-semibold tracking-tight ${
                    active ? "text-white" : "text-slate-900"
                  }`}
                >
                  {cat.label}
                </p>
                <p
                  className={`mt-1 text-xs leading-relaxed ${
                    active ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {cat.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active category rules */}
      <Card padded={false}>
        <CardHeader
          className="border-b border-slate-200/60 px-6 py-4"
          title={activeCategory}
          description={`${activeRules.length} ${activeRules.length === 1 ? "rule" : "rules"}`}
        />
        <div className="border-b border-slate-200/60 px-6 py-4">
          <div className="flex flex-col gap-2 md:flex-row">
            <input
              type="text"
              value={newRuleText}
              onChange={(e) => setNewRuleText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addRule();
              }}
              placeholder={`Add a rule to ${activeCategory.toLowerCase()}…`}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <Button variant="primary" size="md" onClick={addRule} disabled={!newRuleText.trim()}>
              <Plus className="h-3.5 w-3.5" /> Add rule
            </Button>
          </div>
        </div>

        <div className="px-6 py-4">
          {activeRules.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">
              No rules in this category yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {activeRules.map((r) => (
                <li
                  key={r.id}
                  className="flex items-start justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    <p className="text-sm text-slate-800">{r.text}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => removeRule(r.id)}
                    aria-label="Remove rule"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      {/* All rules at a glance */}
      <Card padded={false}>
        <CardHeader
          className="border-b border-slate-200/60 px-6 py-4"
          title="All rules"
          description="Full playbook in one view"
        />
        <div className="divide-y divide-slate-100">
          {CATEGORIES.map((cat) => {
            const items = rules.filter((r) => r.category === cat.id);
            if (items.length === 0) return null;
            return (
              <div key={cat.id} className="px-6 py-5">
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="neutral">{cat.label}</Badge>
                  <span className="text-[11px] text-slate-500">{items.length}</span>
                </div>
                <ul className="space-y-1.5">
                  {items.map((r) => (
                    <li key={r.id} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                      <span>{r.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
