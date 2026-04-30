"use client";

import React from "react";
import Link from "next/link";
import { Play, ArrowRight, Lock, Activity, Clock, RotateCcw, FileText } from "lucide-react";

/* -------------------------------------------------------------
   Mock product UI — lives inline so the homepage is one file.
   Replace ContractReviewDemo with a real <video> when ready
   (see comment in DemoSection).
------------------------------------------------------------- */

function MockTopBar({ filename }: { filename: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.015] px-5 py-3">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-white/10" />
        <span className="h-2 w-2 rounded-full bg-white/10" />
        <span className="h-2 w-2 rounded-full bg-white/10" />
      </div>
      <p className="text-[11px] tracking-tight text-stone-500">{filename}</p>
      <div className="w-12" />
    </div>
  );
}

/* InteractiveDemo: state-machine "video" — no real video file required.
   Phase 0 = preview (static final state with risks visible)
   Phase 1 = uploading | 2 = extracting | 3 = reviewing
   Phase 4 = risks revealing (staggered) | 5 = suggested edit appears
   Phase 6 = email slides up | 7 = done (Replay button) */
function InteractiveDemo() {
  const [phase, setPhase] = React.useState(0);
  const timersRef = React.useRef<number[]>([]);

  function clearTimers() {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }

  function play() {
    clearTimers();
    setPhase(1);
    const schedule: [number, number][] = [
      [1400, 2],
      [2000, 3],
      [3400, 4],
      [5500, 5],
      [7000, 6],
      [9000, 7],
    ];
    schedule.forEach(([ms, p]) => {
      const id = window.setTimeout(() => setPhase(p), ms);
      timersRef.current.push(id);
    });
  }

  React.useEffect(() => () => clearTimers(), []);

  // Visibility helpers
  const showUploadCard = phase === 1;
  const showContractText = phase === 0 || phase >= 2;
  const showHighlights = phase === 0 || phase >= 4;
  const showAnalyzing = phase >= 1 && phase <= 3;
  const showRisksPanel = phase === 0 || phase === 4 || phase === 5;
  const showRiskCards = phase === 0 || phase >= 4;
  const showEditCard = phase === 0 || phase >= 5;
  const showEmail = phase >= 6;

  const analyzingLabel =
    phase === 1
      ? "Uploading…"
      : phase === 2
      ? "Extracting text…"
      : "Reviewing for risk…";

  const RISKS = [
    {
      sev: "High",
      title: "Liability cap below market",
      explanation:
        "6-month limit is well under the industry standard of 12 months.",
      dot: "bg-red-400",
      label: "text-red-300/90",
    },
    {
      sev: "Medium",
      title: "Auto-renewal with 90-day notice",
      explanation:
        "Standard renewal window is 30–60 days; this favors the vendor.",
      dot: "bg-amber-400",
      label: "text-amber-300/90",
    },
    {
      sev: "Low",
      title: "Mutual confidentiality survival",
      explanation: "Survival period is acceptable but should be documented.",
      dot: "bg-emerald-400",
      label: "text-emerald-300/90",
    },
  ];

  return (
    <div className="group relative">
      {/* Soft glow behind */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.5rem] bg-gradient-to-b from-white/[0.04] to-transparent blur-2xl"
      />

      {/* Mockup */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0e] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
        <MockTopBar filename="Acme — Master Services Agreement.pdf" />

        <div className="relative grid min-h-[440px] grid-cols-12">
          {/* ============ LEFT COLUMN ============ */}
          <div className="relative col-span-12 border-b border-white/[0.06] md:col-span-7 md:border-b-0 md:border-r">
            {/* Upload card (phase 1) */}
            <div
              className={`absolute inset-0 flex items-center justify-center px-6 transition-opacity duration-500 ${
                showUploadCard ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <div className="w-full max-w-[320px] rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] ring-1 ring-white/[0.06]">
                    <FileText className="h-4 w-4 text-stone-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-stone-100">
                      Acme — Master Services Agreement.pdf
                    </p>
                    <p className="text-[11px] text-stone-500">2.4 MB · uploading</p>
                  </div>
                </div>
                <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full bg-stone-50"
                    style={{
                      width: phase === 1 ? "100%" : "0%",
                      transition: phase === 1 ? "width 1100ms ease-out" : "none",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Contract text */}
            <div
              className={`p-6 transition-opacity duration-700 ${
                showContractText ? "opacity-100" : "opacity-0"
              }`}
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                Section 8 · Indemnification
              </p>
              <div className="mt-4 space-y-3 text-[12.5px] leading-relaxed text-stone-300">
                <p>
                  Vendor shall indemnify, defend, and hold harmless Customer from any
                  third-party claims arising out of Vendor's gross negligence or willful
                  misconduct.
                </p>
                <p>
                  Customer's sole remedy and Vendor's{" "}
                  <span
                    className={`rounded px-1 transition-colors duration-700 ${
                      showHighlights
                        ? "bg-red-400/15 text-red-200"
                        : "bg-transparent"
                    }`}
                  >
                    total liability
                  </span>{" "}
                  under this Agreement shall not exceed the fees paid in the prior six (6)
                  months.
                </p>
                <p>
                  This Agreement shall automatically{" "}
                  <span
                    className={`rounded px-1 transition-colors duration-700 ${
                      showHighlights
                        ? "bg-amber-300/15 text-amber-200"
                        : "bg-transparent"
                    }`}
                  >
                    renew
                  </span>{" "}
                  for successive one-year terms unless either party provides 90 days' notice.
                </p>
                <p className="text-stone-500">
                  Each party shall maintain commercial general liability insurance with
                  limits of not less than $2,000,000 per occurrence…
                </p>
              </div>
            </div>
          </div>

          {/* ============ RIGHT COLUMN ============ */}
          <div className="relative col-span-12 min-h-[400px] md:col-span-5">
            {/* Analyzing skeleton (phase 1-3) */}
            <div
              className={`absolute inset-0 p-6 transition-opacity duration-500 ${
                showAnalyzing ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                Agent
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
                </span>
                <span className="text-[12px] text-stone-300">{analyzingLabel}</span>
              </div>
              <div className="mt-6 space-y-2">
                {[82, 64, 76, 52, 70].map((w, i) => (
                  <div
                    key={i}
                    className="h-2.5 animate-pulse rounded bg-white/[0.04]"
                    style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
            </div>

            {/* Risks panel (phase 0, 4, 5) */}
            <div
              className={`absolute inset-0 p-6 transition-opacity duration-500 ${
                showRisksPanel ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                Agent · Risk review
              </p>
              <div className="mt-4 space-y-3">
                {RISKS.map((r, i) => (
                  <div
                    key={r.title}
                    style={{
                      transitionDelay: phase === 4 ? `${i * 220}ms` : "0ms",
                    }}
                    className={`rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-all duration-500 ${
                      showRiskCards
                        ? "translate-y-0 opacity-100"
                        : "translate-y-2 opacity-0"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${r.dot}`} />
                      <span
                        className={`text-[10px] font-medium uppercase tracking-[0.18em] ${r.label}`}
                      >
                        {r.sev}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[12.5px] font-medium text-stone-100">
                      {r.title}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500">
                      {r.explanation}
                    </p>
                  </div>
                ))}

                <div
                  className={`rounded-lg border border-white/[0.06] bg-gradient-to-br from-amber-200/[0.06] to-transparent p-3.5 transition-all duration-500 ${
                    showEditCard
                      ? "translate-y-0 opacity-100"
                      : "translate-y-2 opacity-0"
                  }`}
                >
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-amber-200/80">
                    Suggested edit
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-stone-200">
                    "…shall not exceed the fees paid in the{" "}
                    <span className="text-stone-100">prior twelve (12) months</span>."
                  </p>
                </div>
              </div>
            </div>

            {/* Email overlay (phase 6+) */}
            <div
              className={`absolute inset-0 transition-all duration-700 ease-out ${
                showEmail
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-6 opacity-0"
              }`}
            >
              <div className="flex h-full flex-col">
                <div className="border-b border-white/[0.06] px-6 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                    Client email · Draft
                  </p>
                </div>
                <div className="space-y-1.5 border-b border-white/[0.06] px-6 py-3 text-[12px]">
                  <div className="flex gap-3">
                    <span className="w-12 text-stone-500">To</span>
                    <span className="text-stone-200">sarah@acmecorp.com</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-12 text-stone-500">Subject</span>
                    <span className="text-stone-200">
                      MSA review — recommended changes
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden px-6 py-4 text-[12.5px] leading-relaxed text-stone-300">
                  <p>Sarah,</p>
                  <p className="mt-2">
                    Quick read on the MSA. Two items I'd push back on before signing — the
                    liability cap (6 months; we should ask for 12) and the auto-renewal
                    terms (90-day notice favors them).
                  </p>
                  <p className="mt-2 text-stone-500">
                    Suggested redlines attached. Happy to jump on a call.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Initial Play overlay (phase 0) */}
      {phase === 0 && (
        <button
          type="button"
          onClick={play}
          aria-label="Play demo"
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-b from-black/30 via-black/10 to-black/40 transition hover:from-black/20 hover:to-black/30 focus:outline-none"
        >
          <span className="flex items-center gap-3 rounded-full border border-white/15 bg-black/30 px-2 py-2 pr-5 backdrop-blur-md transition group-hover:bg-black/40">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 text-stone-950 transition group-hover:scale-105">
              <Play className="ml-0.5 h-4 w-4 fill-current" />
            </span>
            <span className="text-[13px] font-medium text-stone-100">Watch demo</span>
          </span>
        </button>
      )}

      {/* Replay button (phase 7) */}
      {phase === 7 && (
        <button
          type="button"
          onClick={play}
          className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[12px] text-stone-100 backdrop-blur-md transition hover:bg-black/60"
        >
          <RotateCcw className="h-3 w-3" /> Replay
        </button>
      )}
    </div>
  );
}

function RiskListMockup() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Risks · 4 flagged</p>
      <ul className="mt-4 space-y-2.5">
        {[
          { sev: "High", color: "bg-red-400 text-red-300/90", title: "Uncapped indemnity" },
          {
            sev: "High",
            color: "bg-red-400 text-red-300/90",
            title: "Liability cap below market",
          },
          {
            sev: "Medium",
            color: "bg-amber-400 text-amber-300/90",
            title: "Auto-renewal favors vendor",
          },
          {
            sev: "Low",
            color: "bg-emerald-400 text-emerald-300/90",
            title: "Notice period of 5 business days",
          },
        ].map((r) => {
          const [dot, text] = r.color.split(" ");
          return (
            <li
              key={r.title}
              className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                <span className="text-[12.5px] text-stone-200">{r.title}</span>
              </div>
              <span
                className={`text-[10px] font-medium uppercase tracking-[0.18em] ${text}`}
              >
                {r.sev}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EditDiffMockup() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Suggested edit</p>
      <div className="mt-4 space-y-3">
        <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-3.5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-stone-600">Original</p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-stone-500 line-through decoration-stone-700">
            "Vendor's total liability shall not exceed the fees paid in the prior six (6) months."
          </p>
        </div>
        <div className="flex justify-center">
          <div className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-1">
            <ArrowRight className="h-3 w-3 text-stone-400" />
          </div>
        </div>
        <div className="rounded-lg border border-amber-200/15 bg-gradient-to-br from-amber-200/[0.06] to-transparent p-3.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-amber-200/80">
            Suggested
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-stone-100">
            "Vendor's total liability shall not exceed the fees paid in the{" "}
            <span className="rounded bg-amber-200/10 px-0.5">prior twelve (12) months</span>."
          </p>
        </div>
      </div>
    </div>
  );
}

function PushbackMockup() {
  const points = [
    "Counter the 6-month cap with a mutual 12-month cap on direct damages.",
    "Cap auto-renewal at one term unless re-signed.",
    "Add a 30-day cure right before termination for breach.",
    "Make confidentiality survival mutual and tied to 3 years.",
  ];
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
        Negotiation points · 4
      </p>
      <ul className="mt-4 space-y-3">
        {points.map((p, i) => (
          <li key={i} className="flex gap-3 text-[12.5px] leading-relaxed text-stone-200">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-stone-500" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmailMockup() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e]">
      <div className="border-b border-white/[0.06] px-5 py-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Client email · Draft</p>
      </div>
      <div className="space-y-2 px-5 py-4 text-[12.5px]">
        <div className="flex gap-3">
          <span className="w-12 text-stone-500">To</span>
          <span className="text-stone-200">sarah@acmecorp.com</span>
        </div>
        <div className="flex gap-3">
          <span className="w-12 text-stone-500">Subject</span>
          <span className="text-stone-200">MSA review — recommended changes</span>
        </div>
      </div>
      <div className="border-t border-white/[0.06] px-5 py-4 text-[12.5px] leading-relaxed text-stone-300">
        <p>Sarah,</p>
        <p className="mt-2">
          Quick read on the MSA. Two items I'd push back on before signing — the liability cap
          (currently 6 months; we should ask for 12) and the auto-renewal terms (90-day notice
          favors them).
        </p>
        <p className="mt-2 text-stone-500">Suggested redlines attached. Happy to jump on a call.</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   Data
------------------------------------------------------------- */

const USE_CASES = [
  { title: "Contract Review", line: "Review NDAs, MSAs, and SOWs in minutes." },
  { title: "Risk Analysis", line: "Surface risk across your contract portfolio." },
  { title: "Due Diligence", line: "Accelerate diligence on every deal." },
  { title: "Document Management", line: "One memory layer for every contract you've signed." },
];

const CAPABILITIES: {
  title: string;
  line: string;
  Mockup: React.ComponentType;
}[] = [
  {
    title: "AI Contract Review",
    line: "Reviews contracts and flags risk instantly.",
    Mockup: RiskListMockup,
  },
  {
    title: "Suggested Edits",
    line: "Generates clause-level recommendations and replacement language.",
    Mockup: EditDiffMockup,
  },
  {
    title: "Negotiation Intelligence",
    line: "Knows exactly what to push back on.",
    Mockup: PushbackMockup,
  },
  {
    title: "Client-Ready Outputs",
    line: "Summaries and emails ready to send.",
    Mockup: EmailMockup,
  },
];

const METRICS: { value: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "256-bit", label: "Encryption", icon: Lock },
  { value: "99.9%", label: "Uptime", icon: Activity },
  { value: "<50ms", label: "Response", icon: Clock },
];

/* -------------------------------------------------------------
   Page
------------------------------------------------------------- */

export default function Homepage() {
  const [activeUseCase, setActiveUseCase] = React.useState(0);
  const [activeCapability, setActiveCapability] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setActiveUseCase((i) => (i + 1) % USE_CASES.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const ActiveMockup = CAPABILITIES[activeCapability].Mockup;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09090b] font-sans text-stone-50 antialiased selection:bg-stone-100/10">
      {/* ============ Atmospheric layers ============ */}
      {/* Top spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[900px]"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,255,255,0.05), transparent 70%)",
        }}
      />
      {/* Side gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 -z-0 w-[40%]"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 0% 30%, rgba(180,150,90,0.04), transparent 70%)",
        }}
      />
      {/* Subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 50%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 50%, transparent 100%)",
        }}
      />
      {/* Film grain */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* ============ Nav ============ */}
      <nav className="relative z-10">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-6 md:px-12">
          <Link
            href="/"
            className="text-[13px] font-medium tracking-tight text-stone-100"
          >
            AgileClause
          </Link>
          <div className="flex items-center gap-8 text-[13px]">
            <Link
              href="/login"
              className="text-stone-500 transition hover:text-stone-100"
            >
              Sign in
            </Link>
            <Link
              href="/demo"
              className="text-stone-500 transition hover:text-stone-100"
            >
              Request demo
            </Link>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="relative z-10">
        <div className="mx-auto max-w-[1200px] px-5 pb-16 pt-24 md:px-12 md:pt-40">
          <h1 className="font-[family-name:var(--font-serif)] max-w-[18ch] text-[44px] font-normal leading-[1.02] tracking-[-0.02em] text-stone-50 md:text-[80px] lg:text-[100px]">
            Review contracts in minutes,{" "}
            <span className="italic text-stone-400">not hours.</span>
          </h1>
          <p className="mt-10 max-w-[42ch] text-[15px] leading-relaxed text-stone-400 md:text-[17px]">
            Flag risk, identify missing clauses, and generate suggested edits instantly.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-full bg-stone-50 px-7 py-3.5 text-[13px] font-medium tracking-tight text-stone-950 transition hover:bg-white"
            >
              Upload a contract
            </Link>
            <Link
              href="/demo"
              className="text-[13px] text-stone-400 transition hover:text-stone-100"
            >
              Request demo
            </Link>
          </div>
        </div>
      </section>

      {/* ============ DEMO SECTION ============ */}
      <section className="relative z-10">
        <div className="mx-auto max-w-[1200px] px-5 pb-20 md:px-12 md:pb-44">
          {/* Caption */}
          <p className="mb-8 text-[13px] text-stone-500">
            See AgileClause review a contract in under 2 minutes
          </p>

          {/* Animated walkthrough — no real video needed. Click "Watch demo" to play.
              When you have a real recording, replace <InteractiveDemo /> with:
                <video src="/demo.mp4" controls poster="/demo-poster.jpg"
                       className="w-full rounded-2xl border border-white/[0.08] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]" />
          */}
          <InteractiveDemo />
        </div>
      </section>

      {/* ============ STATEMENT ============ */}
      <section className="relative z-10">
        <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-12 md:py-44">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-12 md:items-center md:gap-12">
            {/* Text */}
            <div className="md:col-span-6">
              <h2 className="font-[family-name:var(--font-serif)] max-w-[16ch] text-[36px] font-normal leading-[1.05] tracking-[-0.02em] text-stone-100 md:text-[60px]">
                Built for the way legal teams{" "}
                <span className="italic text-stone-400">actually</span> work.
              </h2>
              <p className="mt-8 max-w-[42ch] text-[15px] leading-relaxed text-stone-400 md:text-[17px]">
                AI that understands contracts, identifies risk, and accelerates your workflow —
                without the dashboard sprawl most legal tech ships with.
              </p>
            </div>

            {/* Visual anchor */}
            <div className="relative md:col-span-6">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-amber-200/[0.05] via-white/[0.02] to-transparent blur-2xl"
              />
              <div className="rotate-[-1deg] transition duration-700 hover:rotate-0">
                <RiskListMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CAPABILITIES — interactive ============ */}
      <section className="relative z-10">
        <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-12 md:py-44">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-12 md:gap-16">
            {/* Left: capability list */}
            <ul className="md:col-span-6">
              {CAPABILITIES.map((c, i) => {
                const isActive = i === activeCapability;
                return (
                  <li
                    key={c.title}
                    onMouseEnter={() => setActiveCapability(i)}
                    onClick={() => setActiveCapability(i)}
                    className="group cursor-pointer border-b border-white/[0.05] py-7 transition first:border-t md:py-9"
                  >
                    <div className="flex items-baseline justify-between gap-6">
                      <h3
                        className={`font-[family-name:var(--font-serif)] text-[28px] font-normal leading-[1.05] tracking-[-0.015em] transition-colors duration-500 md:text-[44px] ${
                          isActive ? "text-stone-50" : "text-stone-600 group-hover:text-stone-300"
                        }`}
                      >
                        {c.title}
                      </h3>
                      <span
                        className={`text-[10px] font-medium tracking-[0.18em] transition ${
                          isActive ? "text-amber-200/80" : "text-stone-700"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p
                      className={`mt-3 max-w-[44ch] text-[14px] leading-relaxed transition-colors duration-500 ${
                        isActive ? "text-stone-400" : "text-stone-600"
                      }`}
                    >
                      {c.line}
                    </p>
                  </li>
                );
              })}
            </ul>

            {/* Right: preview, sticky on desktop */}
            <div className="md:col-span-6">
              <div className="md:sticky md:top-24">
                <div className="relative">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-white/[0.04] to-transparent blur-2xl"
                  />
                  <div
                    key={activeCapability}
                    className="animate-[fadeInUp_0.5s_ease-out_forwards]"
                    style={{ animationName: "fadeIn" }}
                  >
                    <ActiveMockup />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ USE CASES ============ */}
      <section className="relative z-10">
        <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-12 md:py-44">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:items-center md:gap-12">
            {/* Vertical list */}
            <ul className="md:col-span-8 space-y-2 md:space-y-3">
              {USE_CASES.map((item, i) => {
                const isActive = i === activeUseCase;
                return (
                  <li
                    key={item.title}
                    onMouseEnter={() => setActiveUseCase(i)}
                    className="cursor-default"
                  >
                    <span
                      className={`font-[family-name:var(--font-serif)] block text-[40px] font-normal leading-[1.05] tracking-[-0.02em] transition-all duration-1000 ease-out md:text-[80px] lg:text-[104px] ${
                        isActive
                          ? "text-stone-50"
                          : "text-stone-800 hover:text-stone-600"
                      }`}
                    >
                      {item.title}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* Active supporting line */}
            <div className="md:col-span-4">
              <div className="border-l border-white/[0.06] pl-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-stone-500">
                  {String(activeUseCase + 1).padStart(2, "0")} ·{" "}
                  {USE_CASES.length.toString().padStart(2, "0")}
                </p>
                <p
                  key={activeUseCase}
                  className="mt-4 max-w-[26ch] animate-[fadeIn_0.6s_ease-out] text-[15px] leading-relaxed text-stone-300 md:text-[17px]"
                >
                  {USE_CASES[activeUseCase].line}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECURITY ============ */}
      <section className="relative z-10">
        <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-12 md:py-44">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-12 md:items-center md:gap-12">
            <div className="md:col-span-5">
              <h2 className="font-[family-name:var(--font-serif)] max-w-[14ch] text-[36px] font-normal leading-[1.05] tracking-[-0.02em] text-stone-100 md:text-[56px]">
                Your data, protected.
              </h2>
              <p className="mt-6 max-w-[36ch] text-[14px] leading-relaxed text-stone-500">
                Encryption in transit and at rest. SOC 2 ready infrastructure. Data never trains
                third-party models.
              </p>
            </div>

            <dl className="md:col-span-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {METRICS.map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.label}
                    className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.025] to-transparent p-6 transition hover:border-white/[0.1] hover:from-white/[0.04]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition group-hover:opacity-100"
                      style={{
                        background:
                          "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.06), transparent 70%)",
                      }}
                    />
                    <Icon className="h-3.5 w-3.5 text-stone-500" />
                    <dd className="font-[family-name:var(--font-serif)] mt-6 text-[40px] font-normal leading-none tracking-[-0.02em] text-stone-50 md:text-[44px]">
                      {m.value}
                    </dd>
                    <dt className="mt-3 text-[12px] uppercase tracking-[0.18em] text-stone-500">
                      {m.label}
                    </dt>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative z-10">
        <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-12 md:py-44">
          <div
            className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.025] to-transparent p-10 md:p-20"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-[400px]"
              style={{
                background:
                  "radial-gradient(ellipse 60% 70% at 50% 0%, rgba(255,255,255,0.04), transparent 70%)",
              }}
            />
            <h2 className="font-[family-name:var(--font-serif)] max-w-[20ch] text-[36px] font-normal leading-[1.02] tracking-[-0.02em] text-stone-50 md:text-[64px] lg:text-[80px]">
              Review your first contract in{" "}
              <span className="italic text-stone-400">under two minutes.</span>
            </h2>
            <div className="mt-12 flex flex-wrap items-center gap-8">
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-full bg-stone-50 px-7 py-3.5 text-[13px] font-medium tracking-tight text-stone-950 transition hover:bg-white"
              >
                Upload a contract
              </Link>
              <Link
                href="/demo"
                className="text-[13px] text-stone-400 transition hover:text-stone-100"
              >
                Request demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-10">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-5 py-10 md:px-12">
          <p className="text-[12px] tracking-tight text-stone-600">
            AgileClause — © {new Date().getFullYear()}
          </p>
          <p className="text-[12px] tracking-tight text-stone-600">
            For attorney review. Not legal advice.
          </p>
        </div>
      </footer>

      {/* Local keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
