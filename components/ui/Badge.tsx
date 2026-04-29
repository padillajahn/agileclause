"use client";

import React from "react";

export type BadgeVariant =
  | "neutral"
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "gold"
  | "slate";

const VARIANTS: Record<BadgeVariant, string> = {
  neutral: "bg-slate-50 text-slate-700 border-slate-200",
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  red: "bg-red-50 text-red-700 border-red-100",
  gold: "bg-amber-50 text-amber-800 border-amber-200",
  slate: "bg-slate-900 text-slate-100 border-slate-900",
};

export function Badge({
  children,
  variant = "neutral",
  className = "",
  dot = false,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide ${VARIANTS[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            variant === "red"
              ? "bg-red-500"
              : variant === "amber" || variant === "gold"
              ? "bg-amber-500"
              : variant === "green"
              ? "bg-emerald-500"
              : variant === "blue"
              ? "bg-blue-500"
              : "bg-slate-400"
          }`}
        />
      )}
      {children}
    </span>
  );
}

export function RiskBadge({ level }: { level: "Low" | "Medium" | "High" | null | undefined }) {
  if (!level) return <span className="text-xs text-slate-400">—</span>;
  const variant: BadgeVariant = level === "High" ? "red" : level === "Medium" ? "amber" : "green";
  return (
    <Badge variant={variant} dot>
      {level}
    </Badge>
  );
}
