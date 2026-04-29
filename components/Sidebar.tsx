"use client";

import React from "react";
import Link from "next/link";
import {
  LogOut,
  FileText,
  Sparkles,
  BookOpen,
  Database,
  Users,
  Settings as SettingsIcon,
  BarChart,
  ChevronDown,
} from "lucide-react";

export type SidebarTab =
  | "Contracts"
  | "Agent"
  | "Playbooks"
  | "Knowledge"
  | "Team"
  | "Settings"
  | "Admin";

const PRIMARY: { label: SidebarTab; icon: React.ComponentType<any> }[] = [
  { label: "Contracts", icon: FileText },
  { label: "Agent", icon: Sparkles },
  { label: "Playbooks", icon: BookOpen },
  { label: "Knowledge", icon: Database },
  { label: "Team", icon: Users },
];

type Props = {
  active: SidebarTab;
  onChange: (tab: SidebarTab) => void;
  profile: { full_name?: string | null; email: string; role?: string } | null;
  onSignOut: () => void;
  isAdmin?: boolean;
};

export default function Sidebar({ active, onChange, profile, onSignOut, isAdmin }: Props) {
  const initial =
    (profile?.full_name?.[0] || profile?.email?.[0] || "A").toUpperCase();

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-full w-72 flex-col border-r border-white/5 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300/20 to-amber-500/10 ring-1 ring-amber-200/20">
            <span className="text-sm font-semibold text-amber-100">A</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight text-white">AgileClause</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-amber-200/70">
              Legal Intelligence
            </p>
          </div>
        </Link>
      </div>

      {/* Workspace switcher */}
      <div className="px-3 pt-3">
        <button className="flex w-full items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-2 text-left transition hover:bg-white/[0.06]">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-500/30 to-blue-700/30 ring-1 ring-blue-200/10 text-xs font-semibold text-blue-100">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white">
              {profile?.full_name || profile?.email || "Workspace"}
            </p>
            <p className="truncate text-[10px] capitalize text-slate-400">
              {profile?.role || "Member"}
            </p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pt-4 pb-2">
        <p className="px-2.5 pb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
          Workspace
        </p>
        <ul className="space-y-0.5">
          {PRIMARY.map(({ label, icon: Icon }) => {
            const isActive = active === label;
            return (
              <li key={label}>
                <button
                  onClick={() => onChange(label)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-white/[0.06] text-white"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-amber-300" />
                  )}
                  <Icon
                    className={`h-4 w-4 transition ${
                      isActive
                        ? "text-amber-200"
                        : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  />
                  <span className="font-medium tracking-tight">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 px-2.5 pb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
          System
        </p>
        <ul className="space-y-0.5">
          <li>
            <button
              onClick={() => onChange("Settings")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active === "Settings"
                  ? "bg-white/[0.06] text-white"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
              }`}
            >
              <SettingsIcon className="h-4 w-4 text-slate-500" /> Settings
            </button>
          </li>
          {isAdmin && (
            <li>
              <button
                onClick={() => onChange("Admin")}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active === "Admin"
                    ? "bg-white/[0.06] text-white"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                }`}
              >
                <BarChart className="h-4 w-4 text-slate-500" /> Admin
              </button>
            </li>
          )}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 px-3 py-3">
        {profile && (
          <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 ring-1 ring-white/10 text-xs font-semibold text-slate-200">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-200">
                {profile.full_name || profile.email}
              </p>
              <p className="truncate text-[10px] text-slate-500">{profile.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={onSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </aside>
  );
}
