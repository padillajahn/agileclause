"use client";

import React from "react";
import { UserPlus, Mail, Copy, Clock, Users } from "lucide-react";
import { PageHero, SectionHeader } from "../ui/SectionHeader";
import { Card, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { MetricCard } from "../ui/MetricCard";
import { EmptyState } from "../ui/EmptyState";
import type { TeamMember, Invitation } from "./types";

type Props = {
  currentUserId?: string;
};

const ROLE_VARIANT: Record<string, "neutral" | "blue" | "gold"> = {
  admin: "gold",
  editor: "blue",
  viewer: "neutral",
};

export default function TeamPage({ currentUserId }: Props) {
  const [team, setTeam] = React.useState<TeamMember[]>([]);
  const [invitations, setInvitations] = React.useState<Invitation[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState("viewer");
  const [inviteLoading, setInviteLoading] = React.useState(false);
  const [lastInviteLink, setLastInviteLink] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/team");
        if (r.ok) {
          const j = await r.json();
          setTeam(j.members || []);
          setInvitations(j.invitations || []);
        }
      } catch {
        // swallow
      }
    })();
  }, []);

  function closeModal() {
    setInviteModalOpen(false);
    setLastInviteLink(null);
    setInviteEmail("");
    setInviteRole("viewer");
  }

  async function submitInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteLoading(true);
    try {
      const r = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const j = await r.json();
      if (r.ok && j.invitation) {
        setLastInviteLink(j.invitation.invite_link);
        setInvitations([j.invitation, ...invitations]);
      } else {
        alert(j.error || "Invite failed");
      }
    } catch {
      alert("Failed to send invitation");
    } finally {
      setInviteLoading(false);
    }
  }

  const admins = team.filter((m) => m.role === "admin").length;

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Team"
        title="Members & Access"
        description="Manage who can review contracts, edit playbooks, and administer this workspace."
      >
        <Button variant="primary" size="sm" onClick={() => setInviteModalOpen(true)}>
          <UserPlus className="h-3.5 w-3.5" /> Invite member
        </Button>
      </PageHero>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard label="Members" value={team.length} icon={Users} />
        <MetricCard label="Admins" value={admins} hint="full access" />
        <MetricCard label="Pending invites" value={invitations.length} icon={Clock} />
      </div>

      {/* Members table */}
      <Card padded={false}>
        <CardHeader
          className="border-b border-slate-200/60 px-6 py-4"
          title="Members"
          description={`${team.length} ${team.length === 1 ? "person" : "people"}`}
        />
        {team.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No team members yet"
            description="Invite a colleague to start collaborating on contract review."
            action={
              <Button variant="primary" size="sm" onClick={() => setInviteModalOpen(true)}>
                <UserPlus className="h-3.5 w-3.5" /> Invite member
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 text-[11px] font-medium uppercase tracking-widest text-slate-500">
                <th className="px-6 py-3">Name</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {team.map((m) => {
                const initial = (m.name || m.email || "?")[0]?.toUpperCase();
                return (
                  <tr key={m.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-100 text-xs font-semibold text-slate-600">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">{m.name}</p>
                          {m.id === currentUserId && (
                            <p className="text-[10px] uppercase tracking-widest text-blue-600">
                              You
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600">{m.email}</td>
                    <td className="px-3 py-3">
                      <Badge variant={ROLE_VARIANT[m.role] || "neutral"}>
                        {m.role}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {m.id !== currentUserId && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={async () => {
                            if (!confirm("Remove this team member?")) return;
                            const r = await fetch(`/api/team?id=${m.id}&type=member`, {
                              method: "DELETE",
                            });
                            if (r.ok) setTeam(team.filter((t) => t.id !== m.id));
                            else alert("Failed to remove member");
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </Card>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <Card padded={false}>
          <CardHeader
            className="border-b border-slate-200/60 px-6 py-4"
            title="Pending invitations"
            description={`${invitations.length} pending`}
          />
          <ul className="divide-y divide-slate-100">
            {invitations.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between gap-3 px-6 py-3.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-100">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{inv.email}</p>
                    <p className="text-xs text-slate-500">
                      Invited as {inv.role} ·{" "}
                      {inv.expires_at
                        ? `expires ${new Date(inv.expires_at).toLocaleDateString()}`
                        : "expires soon"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {inv.invite_link && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        navigator.clipboard.writeText(inv.invite_link!);
                        alert("Link copied");
                      }}
                    >
                      <Copy className="h-3 w-3" /> Copy link
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="xs"
                    onClick={async () => {
                      if (!confirm("Cancel this invitation?")) return;
                      const r = await fetch(
                        `/api/team?id=${inv.id}&type=invitation`,
                        { method: "DELETE" },
                      );
                      if (r.ok) setInvitations(invitations.filter((i) => i.id !== inv.id));
                      else alert("Failed to cancel invitation");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Permissions reference */}
      <Card padded={false}>
        <CardHeader
          className="border-b border-slate-200/60 px-6 py-4"
          title="Roles & permissions"
          description="What each role can do in this workspace"
        />
        <div className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">
          <div className="px-6 py-4">
            <Badge variant="gold">Admin</Badge>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Full access. Can invite, manage roles, edit playbooks, and configure settings.
            </p>
          </div>
          <div className="px-6 py-4">
            <Badge variant="blue">Editor</Badge>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Can upload contracts, run the agent, and edit playbook rules. Cannot manage members.
            </p>
          </div>
          <div className="px-6 py-4">
            <Badge variant="neutral">Viewer</Badge>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Read-only access to contracts, agent reviews, and playbooks.
            </p>
          </div>
        </div>
      </Card>

      {/* Invite modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold tracking-tight text-slate-900">
              Invite team member
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              They'll get a private link to join this workspace.
            </p>

            {lastInviteLink ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <p className="text-xs font-medium text-emerald-800">
                    Invitation created. Share this link:
                  </p>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={lastInviteLink}
                      readOnly
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(lastInviteLink);
                        alert("Link copied");
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button variant="primary" size="md" className="w-full" onClick={closeModal}>
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={submitInvite} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      required
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="viewer">Viewer — Read only</option>
                    <option value="editor">Editor — Upload, review, edit playbooks</option>
                    <option value="admin">Admin — Full access</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="secondary"
                    size="md"
                    type="button"
                    className="flex-1"
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    className="flex-1"
                    disabled={inviteLoading}
                  >
                    {inviteLoading ? "Sending…" : "Send invitation"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
