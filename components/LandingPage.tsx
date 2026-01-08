"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  Shield,
  Zap,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Scale,
  Lock,
  BarChart3,
} from "lucide-react";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, [supabase.auth]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Gradient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight">AgileClause</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#security" className="hover:text-white transition">Security</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-100 transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/demo"
                  className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-100 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400 mb-8">
          <Sparkles className="w-4 h-4 text-blue-400" />
          AI-Powered Contract Intelligence
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
          Professional-Grade AI
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            for Legal Teams
          </span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Analyze contracts in seconds. Flag risks automatically. Stay compliant effortlessly.
          AgileClause brings enterprise AI to your legal workflow.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition group"
          >
            Request Demo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-medium rounded-lg hover:bg-white/5 transition"
          >
            Sign In
          </Link>
        </div>

        {/* Hero Visual */}
        <div className="relative mt-20">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent z-10 pointer-events-none" />
          <div className="relative bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-1">
            <div className="bg-[#12121a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-4 text-xs text-gray-500">AgileClause — Contract Analysis</span>
              </div>
              <div className="p-6 min-h-[300px] flex items-center justify-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center mb-3">
                      <Shield className="w-4 h-4 text-red-400" />
                    </div>
                    <p className="text-sm font-medium mb-1">3 Risks Detected</p>
                    <p className="text-xs text-gray-500">Unlimited liability, auto-renewal, IP assignment</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-sm font-medium mb-1">12 Key Clauses</p>
                    <p className="text-xs text-gray-500">Termination, indemnity, warranty, payment terms</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mb-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-sm font-medium mb-1">94% Compliant</p>
                    <p className="text-xs text-gray-500">Meets company policy standards</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="relative z-10 border-y border-white/10 py-12 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-gray-500 mb-8">
            Trusted by legal teams at leading companies
          </p>
          <div className="flex items-center justify-center gap-12 opacity-50 flex-wrap">
            {["Fortune 500", "Tech Corp", "Legal LLP", "Finance Inc", "Startup Co"].map((name) => (
              <div key={name} className="text-xl font-semibold text-gray-400 tracking-tight">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need for
            <br />
            <span className="text-gray-400">smarter contract management</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: "Instant Analysis",
              description:
                "Upload any contract and get AI-powered insights in seconds. Identify risks, key terms, and obligations automatically.",
              color: "yellow",
            },
            {
              icon: Shield,
              title: "Risk Detection",
              description:
                "Our AI flags problematic clauses, unlimited liability, unfavorable terms, and compliance issues before you sign.",
              color: "red",
            },
            {
              icon: MessageSquare,
              title: "Contract Q&A",
              description:
                "Ask questions about any contract in plain English. Get instant answers with citations to specific clauses.",
              color: "blue",
            },
            {
              icon: Scale,
              title: "Compliance Tracking",
              description:
                "Monitor your contract portfolio against company policies. Get alerts when terms deviate from standards.",
              color: "purple",
            },
            {
              icon: FileText,
              title: "Template Library",
              description:
                "Create and manage reusable contract templates. Ensure consistency across all your agreements.",
              color: "green",
            },
            {
              icon: BarChart3,
              title: "Analytics Dashboard",
              description:
                "Track contract metrics, turnaround times, and risk trends across your entire organization.",
              color: "cyan",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group p-6 bg-white/[0.02] border border-white/10 rounded-2xl hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  feature.color === "yellow"
                    ? "bg-yellow-500/10"
                    : feature.color === "red"
                    ? "bg-red-500/10"
                    : feature.color === "blue"
                    ? "bg-blue-500/10"
                    : feature.color === "purple"
                    ? "bg-purple-500/10"
                    : feature.color === "green"
                    ? "bg-green-500/10"
                    : "bg-cyan-500/10"
                }`}
              >
                <feature.icon
                  className={`w-6 h-6 ${
                    feature.color === "yellow"
                      ? "text-yellow-400"
                      : feature.color === "red"
                      ? "text-red-400"
                      : feature.color === "blue"
                      ? "text-blue-400"
                      : feature.color === "purple"
                      ? "text-purple-400"
                      : feature.color === "green"
                      ? "text-green-400"
                      : "text-cyan-400"
                  }`}
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="relative z-10 border-y border-white/10 py-32 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-sm text-green-400 mb-6">
                <Lock className="w-4 h-4" />
                Enterprise Security
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Built for enterprise
                <br />
                security requirements
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Your contracts contain sensitive information. AgileClause is built from the ground up with
                security and privacy at its core, meeting the strictest enterprise requirements.
              </p>
              <ul className="space-y-4">
                {[
                  "SOC 2 Type II certified",
                  "End-to-end encryption at rest and in transit",
                  "No training on your data — ever",
                  "Role-based access controls",
                  "SSO and SAML integration",
                  "Audit logs and compliance reporting",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-[#12121a] border border-white/10 rounded-2xl p-8">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-500/10 rounded-2xl">
                  <Lock className="w-10 h-10 text-green-400" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold mb-2">256-bit AES</p>
                  <p className="text-gray-500">Encryption Standard</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold">99.9%</p>
                    <p className="text-xs text-gray-500">Uptime SLA</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold">&lt;50ms</p>
                    <p className="text-xs text-gray-500">Response Time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to transform your
          <br />
          contract workflow?
        </h2>
        <p className="text-xl text-gray-400 max-w-xl mx-auto mb-10">
          Join leading legal teams using AgileClause to review contracts faster and reduce risk.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition group text-lg"
          >
            Request Demo
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white font-medium rounded-lg hover:bg-white/5 transition text-lg"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold">AgileClause</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Security</a>
              <a href="#" className="hover:text-white transition">Contact</a>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 AgileClause. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
