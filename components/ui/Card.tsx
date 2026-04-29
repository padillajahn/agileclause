"use client";

import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
  interactive?: boolean;
  bordered?: boolean;
};

export function Card({
  className = "",
  padded = true,
  interactive = false,
  bordered = true,
  ...rest
}: CardProps) {
  const base = "rounded-2xl bg-white";
  const border = bordered ? "border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)]" : "";
  const pad = padded ? "p-6" : "";
  const hover = interactive
    ? "transition cursor-pointer hover:border-slate-300 hover:shadow-[0_8px_24px_-8px_rgba(15,23,42,0.12)]"
    : "";
  return <div className={`${base} ${border} ${pad} ${hover} ${className}`} {...rest} />;
}

export function CardHeader({
  title,
  description,
  action,
  className = "",
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h3>
        {description && (
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
