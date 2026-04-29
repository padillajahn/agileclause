"use client";

import React from "react";

export function MetricCard({
  label,
  value,
  hint,
  trend,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  trend?: { value: string; positive?: boolean };
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
          {label}
        </p>
        {Icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {trend && (
          <span
            className={`font-medium ${
              trend.positive ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        )}
        {hint && <span className="text-slate-500">{hint}</span>}
      </div>
    </div>
  );
}
