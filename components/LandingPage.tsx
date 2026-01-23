"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  Zap,
  MessageSquare,
  ArrowRight,
  Lock,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const logos = [
  "Kirkland & Ellis",
  "Latham & Watkins",
  "Skadden",
  "White & Case",
  "Jones Day",
  "Sidley Austin",
  "Gibson Dunn",
  "Sullivan & Cromwell",
];

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, [supabase.auth]);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafaf9] overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-50" />

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/logo.png" alt="AgileClause" className="w-7 h-7 sm:w-9 sm:h-9" />
            <span className="text-lg sm:text-xl font-semibold tracking-[-0.02em]">AgileClause</span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-[15px] text-[#a1a1aa]">
            <a href="#features" className="hover:text-[#fafaf9] transition-colors duration-200">
              Features
            </a>
            <a href="#security" className="hover:text-[#fafaf9] transition-colors duration-200">
              Security
            </a>
            <a href="#pricing" className="hover:text-[#fafaf9] transition-colors duration-200">
              Pricing
            </a>
          </div>

          <div className="hidden sm:flex items-center gap-3 sm:gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#fafaf9] text-[#09090b] text-sm sm:text-[15px] font-medium rounded-full hover:bg-[#e4e4e7] transition-all duration-200 btn-glow"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-[15px] text-[#a1a1aa] hover:text-[#fafaf9] transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/demo"
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#fafaf9] text-[#09090b] text-sm sm:text-[15px] font-medium rounded-full hover:bg-[#e4e4e7] transition-all duration-200 btn-glow"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="sm:hidden p-2 text-[#a1a1aa]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-white/[0.06] bg-[#09090b] px-4 py-4 space-y-3">
            <a href="#features" className="block py-2 text-[#a1a1aa]" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#security" className="block py-2 text-[#a1a1aa]" onClick={() => setMobileMenuOpen(false)}>Security</a>
            <a href="#pricing" className="block py-2 text-[#a1a1aa]" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <div className="pt-3 border-t border-white/[0.06] space-y-2">
              {isLoggedIn ? (
                <Link href="/dashboard" className="block w-full text-center px-4 py-2.5 bg-[#fafaf9] text-[#09090b] text-sm font-medium rounded-full">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="block w-full text-center px-4 py-2.5 text-sm text-[#a1a1aa] border border-white/[0.1] rounded-full">
                    Sign In
                  </Link>
                  <Link href="/demo" className="block w-full text-center px-4 py-2.5 bg-[#fafaf9] text-[#09090b] text-sm font-medium rounded-full">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pt-16 sm:pt-24 md:pt-32 pb-16 sm:pb-24 text-center">
        <div className="animate-fade-in-up">
          <h1 className="text-[clamp(2.5rem,8vw,7rem)] font-bold tracking-[-0.04em] leading-[0.95] mb-6 sm:mb-8">
            <span className="block">Professional</span>
            <span className="block gradient-text">Class AI</span>
          </h1>

          <p className="text-base sm:text-xl md:text-2xl text-[#71717a] max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed tracking-[-0.01em] animate-fade-in-up animate-delay-100 px-2">
            AI-powered contract analysis for modern legal teams.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>Review faster. Risk less. Close more.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up animate-delay-200">
            <Link
              href="/demo"
              className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-[#fafaf9] text-[#09090b] text-base sm:text-lg font-medium rounded-full hover:bg-[#e4e4e7] transition-all duration-300 btn-glow"
            >
              Request Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg text-[#a1a1aa] hover:text-[#fafaf9] transition-colors duration-200"
            >
              Learn More
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Hero Visual - Dashboard mockup */}
        <div className="relative mt-12 sm:mt-16 md:mt-24 animate-fade-in-up animate-delay-300">
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent z-20 pointer-events-none h-full" />
          <div className="relative mx-auto max-w-5xl">
            <div className="relative bg-[#18181b]/50 backdrop-blur-sm border border-white/[0.06] rounded-xl sm:rounded-2xl overflow-hidden glow">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-3 sm:px-5 py-3 sm:py-4 border-b border-white/[0.06] bg-[#09090b]/50">
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#3f3f46]" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#3f3f46]" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#3f3f46]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <span className="text-[10px] sm:text-xs text-[#52525b] tracking-wide">AgileClause</span>
                </div>
              </div>

              {/* Dashboard mockup */}
              <div className="flex min-h-[280px] sm:min-h-[380px]">
                {/* Sidebar - hidden on mobile */}
                <div className="hidden md:flex w-48 flex-col border-r border-white/[0.06] bg-[#fafaf9]/[0.02] p-4">
                  <div className="flex items-center gap-2 mb-6">
                    <img src="/logo.png" alt="AgileClause" className="w-6 h-6" />
                    <span className="text-sm font-medium text-[#fafaf9]">AgileClause</span>
                  </div>
                  <nav className="space-y-1">
                    {[
                      { icon: MessageSquare, label: "Assistant", active: true },
                      { icon: FileText, label: "Vault", active: false },
                      { icon: Zap, label: "Workflows", active: false },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                          item.active
                            ? "bg-blue-500/20 text-blue-400"
                            : "text-[#71717a]"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </div>
                    ))}
                  </nav>
                </div>

                {/* Main content */}
                <div className="flex-1 p-4 sm:p-6 md:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {[
                      {
                        icon: MessageSquare,
                        title: "Assistant",
                        description: "AI-powered legal co-pilot",
                        stat: "1.2s avg response",
                        color: "blue",
                      },
                      {
                        icon: FileText,
                        title: "Vault",
                        description: "Secure contract storage",
                        stat: "247 documents",
                        color: "emerald",
                      },
                      {
                        icon: Zap,
                        title: "Workflows",
                        description: "Automated processes",
                        stat: "12 active",
                        color: "amber",
                      },
                    ].map((card, i) => (
                      <div
                        key={i}
                        className="p-4 sm:p-5 bg-white/[0.03] border border-white/[0.06] rounded-lg sm:rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer"
                      >
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 ${
                            card.color === "blue"
                              ? "bg-blue-500/20"
                              : card.color === "emerald"
                              ? "bg-emerald-500/20"
                              : "bg-amber-500/20"
                          }`}
                        >
                          <card.icon
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${
                              card.color === "blue"
                                ? "text-blue-400"
                                : card.color === "emerald"
                                ? "text-emerald-400"
                                : "text-amber-400"
                            }`}
                          />
                        </div>
                        <h4 className="font-medium text-[#fafaf9] text-sm sm:text-base mb-1">{card.title}</h4>
                        <p className="text-[10px] sm:text-xs text-[#71717a] mb-2 sm:mb-3">{card.description}</p>
                        <p className="text-[10px] sm:text-xs text-[#52525b]">{card.stat}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chat preview - hidden on very small screens */}
                  <div className="hidden sm:block mt-4 sm:mt-6 p-3 sm:p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg sm:rounded-xl">
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-[#fafaf9]">Assistant</p>
                        <p className="text-[10px] sm:text-xs text-[#52525b]">Ready to help</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                      <span className="text-xs sm:text-sm text-[#52525b]">Ask about any contract...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Carousel */}
      <section className="relative z-10 py-10 sm:py-16 border-y border-white/[0.06] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 mb-6 sm:mb-8">
          <p className="text-center text-xs sm:text-sm text-[#52525b] tracking-wide uppercase">
            Trusted by leading law firms
          </p>
        </div>
        <div className="relative">
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#09090b] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#09090b] to-transparent z-10" />

          {/* Scrolling logos */}
          <div className="flex animate-scroll">
            {[...logos, ...logos].map((logo, i) => (
              <div
                key={i}
                className="flex-shrink-0 px-6 sm:px-12 text-base sm:text-xl font-semibold text-[#3f3f46] tracking-[-0.01em] hover:text-[#71717a] transition-colors duration-300"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24 md:py-32">
        <div className="max-w-3xl mb-10 sm:mb-16 md:mb-20">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] mb-4 sm:mb-6">
            Built for the way
            <br />
            <span className="text-[#71717a]">legal teams work</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#71717a] leading-relaxed">
            Enterprise-grade AI that understands contracts, identifies risks, and accelerates your
            workflow without compromising accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              icon: MessageSquare,
              title: "Assistant",
              description:
                "Your AI-powered legal co-pilot. Ask questions in plain English, get instant contract analysis, risk assessments, and clause suggestions with citations to specific sections.",
            },
            {
              icon: FileText,
              title: "Vault",
              description:
                "Secure, centralized contract repository. Store, organize, and search your entire contract portfolio with intelligent tagging, version control, and instant retrieval.",
            },
            {
              icon: Zap,
              title: "Workflows",
              description:
                "Automate your contract lifecycle. Build custom approval flows, set up automated reminders, track obligations, and streamline collaboration across your team.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group p-6 sm:p-8 md:p-10 bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300"
            >
              <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#71717a] mb-4 sm:mb-6 group-hover:text-[#fafaf9] transition-colors duration-300" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 tracking-[-0.01em]">{feature.title}</h3>
              <p className="text-[#71717a] text-sm sm:text-[15px] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="relative z-10 border-y border-white/[0.06] py-16 sm:py-24 md:py-32 bg-white/[0.01]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 md:gap-20 items-center">
            <div>
              <p className="text-xs sm:text-sm text-[#71717a] tracking-wide uppercase mb-4 sm:mb-6">
                Enterprise Security
              </p>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] mb-6 sm:mb-8">
                Your data,
                <br />
                <span className="text-[#71717a]">protected</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-[#71717a] mb-8 sm:mb-10 leading-relaxed">
                Built from the ground up for enterprise security requirements. Your contracts are
                sensitive—we treat them that way.
              </p>
              <div className="space-y-3 sm:space-y-5">
                {[
                  "SOC 2 Type II certified infrastructure",
                  "End-to-end AES-256 encryption",
                  "Zero data training policy",
                  "Role-based access controls & SSO",
                  "Complete audit trail & compliance reporting",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 sm:gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#fafaf9]" />
                    <span className="text-[#a1a1aa] text-sm sm:text-base">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-2xl sm:rounded-3xl" />
              <div className="relative bg-[#18181b]/30 backdrop-blur-sm border border-white/[0.06] rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10">
                <div className="flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 bg-white/[0.03] border border-white/[0.06] rounded-xl sm:rounded-2xl">
                  <Lock className="w-7 h-7 sm:w-9 sm:h-9 text-[#fafaf9]" />
                </div>
                <div className="text-center mb-8 sm:mb-10">
                  <p className="text-3xl sm:text-5xl font-bold tracking-[-0.02em] mb-1 sm:mb-2">256-bit</p>
                  <p className="text-[#52525b] text-xs sm:text-sm tracking-wide uppercase">
                    AES Encryption
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg sm:rounded-xl p-4 sm:p-5 text-center">
                    <p className="text-xl sm:text-3xl font-bold tracking-[-0.02em] mb-1">99.9%</p>
                    <p className="text-[10px] sm:text-xs text-[#52525b]">Uptime SLA</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg sm:rounded-xl p-4 sm:p-5 text-center">
                    <p className="text-xl sm:text-3xl font-bold tracking-[-0.02em] mb-1">&lt;50ms</p>
                    <p className="text-[10px] sm:text-xs text-[#52525b]">Response Time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24 md:py-32 text-center">
        <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold tracking-[-0.03em] mb-6 sm:mb-8">
          Ready to transform
          <br />
          <span className="text-[#71717a]">your workflow?</span>
        </h2>
        <p className="text-base sm:text-xl text-[#71717a] max-w-xl mx-auto mb-8 sm:mb-12 px-2">
          Join the leading legal teams using AgileClause to review contracts faster and reduce
          risk.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/demo"
            className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 sm:py-5 bg-[#fafaf9] text-[#09090b] text-base sm:text-lg font-medium rounded-full hover:bg-[#e4e4e7] transition-all duration-300 btn-glow"
          >
            Request Demo
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg text-[#a1a1aa] hover:text-[#fafaf9] transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-8 sm:py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col items-center gap-6 sm:gap-0 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/logo.png" alt="AgileClause" className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="text-base sm:text-lg font-semibold tracking-[-0.01em]">AgileClause</span>
            </div>
            <div className="flex items-center gap-6 sm:gap-10 text-xs sm:text-sm text-[#52525b]">
              <a href="#" className="hover:text-[#fafaf9] transition-colors duration-200">
                Privacy
              </a>
              <a href="#" className="hover:text-[#fafaf9] transition-colors duration-200">
                Terms
              </a>
              <a href="#" className="hover:text-[#fafaf9] transition-colors duration-200">
                Security
              </a>
              <a href="#" className="hover:text-[#fafaf9] transition-colors duration-200">
                Contact
              </a>
            </div>
            <p className="text-xs sm:text-sm text-[#3f3f46]">
              © 2025 AgileClause. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
