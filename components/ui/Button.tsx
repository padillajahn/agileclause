"use client";

import React from "react";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "danger";
type Size = "xs" | "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-slate-900 text-white border border-slate-900 hover:bg-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.08)]",
  accent:
    "bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 shadow-[0_1px_2px_rgba(37,99,235,0.18)]",
  secondary:
    "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300",
  ghost: "bg-transparent text-slate-600 border border-transparent hover:bg-slate-100",
  danger: "bg-white text-red-600 border border-slate-200 hover:bg-red-50 hover:border-red-200",
};

const SIZES: Record<Size, string> = {
  xs: "px-2 py-1 text-xs gap-1",
  sm: "px-2.5 py-1.5 text-xs gap-1.5",
  md: "px-3.5 py-2 text-sm gap-2",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", className = "", children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-1 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});
