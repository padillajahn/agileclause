"use client";

import React from "react";
import { PageHero } from "../ui/SectionHeader";
import { Card, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import type { SettingsModel } from "./types";

const DEFAULTS: SettingsModel = {
  productName: "AgileClause",
  primaryColor: "#2563eb",
  policy: { governingLaw: "Delaware", liabilityCap: "1x fees", arbitration: "Required" },
};

export default function SettingsPage() {
  const [settings, setSettings] = React.useState<SettingsModel>(DEFAULTS);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/settings");
        if (r.ok) {
          const j = await r.json();
          setSettings(j.settings || DEFAULTS);
        }
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  async function save() {
    try {
      const r = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!r.ok) alert("Save failed");
    } catch {
      alert("Save failed");
    }
  }

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Settings"
        title="Workspace Configuration"
        description="Branding and default policy preferences applied across this workspace."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card padded={false}>
          <CardHeader
            className="border-b border-slate-200/60 px-6 py-4"
            title="Brand"
            description="How the workspace shows up across the product"
          />
          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Product name
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={settings.productName}
                onChange={(e) => setSettings((s) => ({ ...s, productName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Accent color
              </label>
              <input
                type="color"
                className="h-9 w-16 rounded-lg border border-slate-200"
                value={settings.primaryColor}
                onChange={(e) => setSettings((s) => ({ ...s, primaryColor: e.target.value }))}
              />
            </div>
          </div>
        </Card>

        <Card padded={false}>
          <CardHeader
            className="border-b border-slate-200/60 px-6 py-4"
            title="Policy defaults"
            description="Used by the agent when comparing contracts to standard"
          />
          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Preferred governing law
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={settings.policy.governingLaw}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    policy: { ...s.policy, governingLaw: e.target.value },
                  }))
                }
              >
                <option>Delaware</option>
                <option>New York</option>
                <option>California</option>
                <option>England & Wales</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Default liability cap
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={settings.policy.liabilityCap}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    policy: { ...s.policy, liabilityCap: e.target.value },
                  }))
                }
              >
                <option>1x fees</option>
                <option>2x fees</option>
                <option>Direct damages only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Arbitration
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={settings.policy.arbitration}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    policy: { ...s.policy, arbitration: e.target.value as any },
                  }))
                }
              >
                <option>Required</option>
                <option>Optional</option>
                <option>Not allowed</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="primary" size="md" disabled={!loaded} onClick={save}>
          Save changes
        </Button>
        <Button variant="secondary" size="md" onClick={() => setSettings(DEFAULTS)}>
          Reset to defaults
        </Button>
      </div>
    </div>
  );
}
