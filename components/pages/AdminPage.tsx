"use client";

import React from "react";
import { Users, FileText, Activity } from "lucide-react";
import { PageHero } from "../ui/SectionHeader";
import { Card, CardHeader } from "../ui/Card";
import { MetricCard } from "../ui/MetricCard";
import type { AdminStats, DemoRequest } from "./types";

export default function AdminPage() {
  const [adminStats, setAdminStats] = React.useState<AdminStats | null>(null);
  const [demoRequests, setDemoRequests] = React.useState<DemoRequest[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/admin");
        if (r.ok) {
          const j = await r.json();
          setAdminStats(j.stats || null);
        }
      } catch {
        // swallow
      }
      try {
        const r = await fetch("/api/demo-requests");
        if (r.ok) {
          const j = await r.json();
          setDemoRequests(j.requests || []);
        }
      } catch {
        // swallow
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Admin"
        title="Workspace Operations"
        description="Aggregate metrics and inbound demo requests for this deployment."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Monthly active users"
          value={adminStats?.monthlyActiveUsers ?? 0}
          icon={Users}
        />
        <MetricCard
          label="Documents analyzed"
          value={adminStats?.documentsAnalyzed ?? 0}
          icon={FileText}
        />
        <MetricCard
          label="Avg. response"
          value={`${adminStats?.avgResponseSec ?? 1.2}s`}
          icon={Activity}
        />
      </div>

      <Card padded={false}>
        <CardHeader
          className="border-b border-slate-200/60 px-6 py-4"
          title="Demo requests"
          description={`${demoRequests.length} ${
            demoRequests.length === 1 ? "request" : "requests"
          }`}
        />
        {demoRequests.length === 0 ? (
          <p className="px-6 py-8 text-center text-xs text-slate-500">No demo requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 text-[11px] font-medium uppercase tracking-widest text-slate-500">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Company</th>
                  <th className="px-3 py-3">Job title</th>
                  <th className="px-3 py-3">Team size</th>
                  <th className="px-3 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {demoRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {req.first_name} {req.last_name}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600">
                      <a
                        href={`mailto:${req.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {req.email}
                      </a>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600">{req.company_name}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{req.job_title}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{req.team_size}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
