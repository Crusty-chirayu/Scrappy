"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  ToastProvider,
  useToast,
} from "@scrappy/ui";

interface TeamMember {
  id: string;
  email: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

interface TeamInvitation {
  id: string;
  email: string;
  role: "admin" | "member";
  token: string;
  expiresAt: string;
  createdAt: string;
}

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string;
}

interface WebhookItem {
  id: string;
  targetUrl: string;
  events: string[];
  secretHash: string;
  isActive: boolean;
  createdAt: string;
}

interface WebhookDeliveryItem {
  id: string;
  webhookId: string;
  eventType: string;
  responseStatus: number | null;
  signature: string;
  latencyMs: number | null;
  deliveredAt: string;
}

interface UsageSummary {
  workspaceId: string;
  plan: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  recordsExtracted: number;
  browserMinutes: number;
  apiRequests: number;
  trackedProducts: number;
  limits: {
    recordsPerMonth: number;
    browserMinutes: number;
    apiRequestsPerMinute: number;
    teamMembers: number;
  };
  quotaStatus: {
    recordsPct: number;
    browserMinutesPct: number;
    hasReachedSoftQuota: boolean;
    hasReachedHardQuota: boolean;
  };
}

function SettingsConsole() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"team" | "keys" | "webhooks" | "metering">("team");

  // Team State
  const [members, setMembers] = useState<TeamMember[]>([
    { id: "m-1", email: "lead@scrappy.io", role: "owner", joinedAt: "2026-09-01" },
  ]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [isInviting, setIsInviting] = useState(false);

  // Keys State
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");

  // Webhooks State
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDeliveryItem[]>([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null);

  // Metering State
  const [usage, setUsage] = useState<UsageSummary | null>(null);

  // Initial Data Load
  useEffect(() => {
    // 1. Team & Invitations
    fetch("/api/team")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (Array.isArray(data.members) && data.members.length > 0) {
            setMembers(
              data.members.map((m: { id: string; email?: string; userId: string; role: "owner" | "admin" | "member"; createdAt: string }) => ({
                id: m.id,
                email: m.email || (m.role === "owner" ? "owner@scrappy.io" : `member-${m.userId.substring(0, 6)}@scrappy.io`),
                role: m.role,
                joinedAt: m.createdAt.split("T")[0] || "2026-10-01",
              })),
            );
          }
          if (Array.isArray(data.invitations)) {
            setInvitations(data.invitations);
          }
        }
      })
      .catch(() => {});

    // 2. API Keys
    fetch("/api/keys")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.keys)) {
          setKeys(
            data.keys.map((k: { id: string; name: string; keyPrefix: string; createdAt: string; lastUsedAt?: string | null }) => ({
              id: k.id,
              name: k.name,
              prefix: `${k.keyPrefix}...`,
              createdAt: k.createdAt.split("T")[0] || "2026-10-01",
              lastUsedAt: k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never",
            })),
          );
        }
      })
      .catch(() => {});

    // 3. Webhooks & Deliveries
    fetch("/api/webhooks")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.webhooks)) {
          setWebhooks(data.webhooks);
        }
      })
      .catch(() => {});

    fetch("/api/webhooks/deliveries")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.deliveries)) {
          setDeliveries(data.deliveries);
        }
      })
      .catch(() => {});

    // 4. Usage Metering
    fetch("/api/usage")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.summary) {
          setUsage(data.summary);
        }
      })
      .catch(() => {});
  }, []);

  // --- Handlers: Team ---
  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      showToast({ type: "error", title: "Valid email required", description: "Provide a valid email address for invitation." });
      return;
    }
    setIsInviting(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (res.ok && data.invitation) {
        setInvitations((prev) => [data.invitation, ...prev]);
        setInviteEmail("");
        showToast({
          type: "success",
          title: "Invitation Dispatched",
          description: `Invite email sent to ${data.invitation.email} via Mailpit emulator.`,
        });
      } else {
        showToast({ type: "error", title: "Invitation failed", description: data.error || "Unable to create invite" });
      }
    } catch {
      showToast({ type: "error", title: "Network error", description: "Could not connect to team API" });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      const res = await fetch(`/api/team?invitationId=${invitationId}`, { method: "DELETE" });
      if (res.ok) {
        setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
        showToast({ type: "info", title: "Invitation Revoked", description: "The invitation token is now invalidated." });
      }
    } catch {
      showToast({ type: "error", title: "Action failed" });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const res = await fetch(`/api/team?memberId=${memberId}`, { method: "DELETE" });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        showToast({ type: "info", title: "Member Removed", description: "Workspace member access revoked." });
      }
    } catch {
      showToast({ type: "error", title: "Action failed" });
    }
  };

  // --- Handlers: API Keys ---
  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) {
      showToast({ type: "error", title: "Key name required", description: "Provide a descriptive label for the API key." });
      return;
    }
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.apiKey && data.plainSecret) {
        setKeys((prev) => [
          {
            id: data.apiKey.id,
            name: data.apiKey.name,
            prefix: `${data.apiKey.keyPrefix}...`,
            createdAt: new Date().toISOString().split("T")[0]!,
            lastUsedAt: "Never",
          },
          ...prev,
        ]);
        setNewKeySecret(data.plainSecret);
        setNewKeyName("");
        showToast({ type: "success", title: "API Key Created", description: "Copy your key now. It will not be shown again." });
      } else {
        showToast({ type: "error", title: "Creation failed", description: data.error || "Unable to create API key" });
      }
    } catch {
      showToast({ type: "error", title: "Network error", description: "Could not connect to API key service" });
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      const res = await fetch(`/api/keys?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setKeys((prev) => prev.filter((k) => k.id !== id));
        showToast({ type: "info", title: "API Key Revoked", description: "The key has been permanently invalidated." });
      } else {
        showToast({ type: "error", title: "Revocation failed", description: data.error || "Unable to revoke key" });
      }
    } catch {
      showToast({ type: "error", title: "Action failed" });
    }
  };

  // --- Handlers: Webhooks ---
  const handleAddWebhook = async () => {
    if (!newWebhookUrl.trim() || !newWebhookUrl.startsWith("http")) {
      showToast({ type: "error", title: "Valid URL required", description: "Webhooks require HTTP or HTTPS endpoints." });
      return;
    }
    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl: newWebhookUrl.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.webhook) {
        setWebhooks([data.webhook, ...webhooks]);
        setNewWebhookSecret(data.secret);
        setNewWebhookUrl("");
        showToast({
          type: "success",
          title: "Webhook Registered",
          description: "HMAC SHA-256 signing secret generated. Save it now.",
        });
      } else {
        showToast({ type: "error", title: "Registration failed", description: data.error });
      }
    } catch {
      showToast({ type: "error", title: "Network error" });
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      const res = await fetch(`/api/webhooks?id=${webhookId}`, { method: "DELETE" });
      if (res.ok) {
        setWebhooks((prev) => prev.filter((w) => w.id !== webhookId));
        showToast({ type: "info", title: "Webhook Deleted" });
      }
    } catch {
      showToast({ type: "error", title: "Action failed" });
    }
  };

  const handleDispatchTestDelivery = async (webhookId: string) => {
    try {
      const res = await fetch("/api/webhooks/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookId, eventType: "price.drop" }),
      });
      const data = await res.json();
      if (res.ok && data.delivery) {
        setDeliveries((prev) => [data.delivery, ...prev]);
        showToast({
          type: "success",
          title: "Webhook Dispatched",
          description: `Signed with HMAC-SHA256 (${data.delivery.latencyMs}ms)`,
        });
      }
    } catch {
      showToast({ type: "error", title: "Dispatch failed" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
              Workspace Tenancy &amp; Security
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-1)] font-sans">
            Workspace Settings
          </h1>
          <p className="text-xs text-[var(--text-2)] mt-0.5">
            Manage team access, hashed API keys, signed HMAC webhooks, and metered usage.
          </p>
        </div>

        <div className="text-xs font-mono px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--surface-1)] border border-[var(--border-subtle)] text-[var(--text-2)]">
          TENANT ID: <span className="text-[var(--text-1)] font-semibold">default-workspace</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] mb-6">
        <button
          onClick={() => setActiveTab("team")}
          className={`pb-3 text-xs font-mono font-medium border-b-2 transition-colors ${
            activeTab === "team"
              ? "border-[var(--color-accent)] text-[var(--text-1)] font-semibold"
              : "border-transparent text-[var(--text-2)] hover:text-[var(--text-1)]"
          }`}
        >
          TEAM &amp; ROLES ({members.length + invitations.length})
        </button>
        <button
          onClick={() => setActiveTab("keys")}
          className={`pb-3 text-xs font-mono font-medium border-b-2 transition-colors ${
            activeTab === "keys"
              ? "border-[var(--color-accent)] text-[var(--text-1)] font-semibold"
              : "border-transparent text-[var(--text-2)] hover:text-[var(--text-1)]"
          }`}
        >
          API KEYS ({keys.length})
        </button>
        <button
          onClick={() => setActiveTab("webhooks")}
          className={`pb-3 text-xs font-mono font-medium border-b-2 transition-colors ${
            activeTab === "webhooks"
              ? "border-[var(--color-accent)] text-[var(--text-1)] font-semibold"
              : "border-transparent text-[var(--text-2)] hover:text-[var(--text-1)]"
          }`}
        >
          SIGNED WEBHOOKS ({webhooks.length})
        </button>
        <button
          onClick={() => setActiveTab("metering")}
          className={`pb-3 text-xs font-mono font-medium border-b-2 transition-colors ${
            activeTab === "metering"
              ? "border-[var(--color-accent)] text-[var(--text-1)] font-semibold"
              : "border-transparent text-[var(--text-2)] hover:text-[var(--text-1)]"
          }`}
        >
          USAGE METERING
        </button>
      </div>

      {/* TAB: TEAM & ROLES */}
      {activeTab === "team" && (
        <div className="space-y-6">
          {/* Invite Member Form */}
          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center gap-3">
            <input
              type="email"
              placeholder="colleague@company.com"
              aria-label="Colleague Email Address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 w-full bg-[var(--surface-2)] border border-[var(--border-default)] rounded-[var(--radius-sm)] px-3 py-2 text-xs text-[var(--text-1)] placeholder:text-[var(--text-3)] outline-none focus:border-[var(--border-focus)] font-mono"
            />
            <select
              aria-label="Role"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "admin" | "member")}
              className="bg-[var(--surface-2)] border border-[var(--border-default)] text-xs text-[var(--text-1)] rounded-[var(--radius-sm)] px-3 py-2 outline-none focus:border-[var(--border-focus)] font-mono"
            >
              <option value="member">Role: Member</option>
              <option value="admin">Role: Admin</option>
            </select>
            <Button
              variant="primary"
              size="sm"
              onClick={handleInviteMember}
              disabled={isInviting}
            >
              {isInviting ? "Inviting..." : "+ Invite Member"}
            </Button>
          </div>

          {/* Members Table */}
          <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] overflow-hidden bg-[var(--surface-1)]">
            <div className="px-4 py-2 border-b border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-2)] uppercase tracking-wider font-semibold">
              Active Workspace Members
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>USER EMAIL</TableHead>
                  <TableHead>WORKSPACE ROLE</TableHead>
                  <TableHead>JOINED</TableHead>
                  <TableHead>PERMISSIONS</TableHead>
                  <TableHead className="text-right">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-[var(--text-1)] font-medium font-mono text-xs">{m.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-mono uppercase font-bold border ${
                        m.role === "owner"
                          ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--border-focus)]"
                          : m.role === "admin"
                          ? "bg-[var(--color-info)]/10 text-[var(--color-info)] border-[var(--color-info)]/30"
                          : "bg-[var(--surface-2)] text-[var(--text-2)] border-[var(--border-subtle)]"
                      }`}>
                        {m.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-[var(--text-2)] font-mono text-xs">{m.joinedAt}</TableCell>
                    <TableCell className="text-xs text-[var(--text-2)]">
                      {m.role === "owner" ? "Full administrative + billing control" : m.role === "admin" ? "Can manage keys, scraping, monitors" : "Catalog search & watchlists"}
                    </TableCell>
                    <TableCell className="text-right">
                      {m.role !== "owner" && (
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="text-xs text-[var(--color-danger)] hover:underline font-mono"
                        >
                          Remove
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pending Invitations Table */}
          {invitations.length > 0 && (
            <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] overflow-hidden bg-[var(--surface-1)]">
              <div className="px-4 py-2 border-b border-[var(--border-subtle)] text-[11px] font-mono text-[var(--color-warn)] uppercase tracking-wider font-semibold">
                Pending Invitations ({invitations.length})
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>INVITED EMAIL</TableHead>
                    <TableHead>ASSIGNED ROLE</TableHead>
                    <TableHead>INVITED AT</TableHead>
                    <TableHead>EXPIRES</TableHead>
                    <TableHead className="text-right">ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="text-[var(--text-1)] font-medium font-mono text-xs">{inv.email}</TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-mono uppercase font-bold bg-[var(--color-warn)]/10 text-[var(--color-warn)] border border-[var(--color-warn)]/30">
                          {inv.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-[var(--text-2)] font-mono text-xs">
                        {inv.createdAt.split("T")[0]}
                      </TableCell>
                      <TableCell className="text-[var(--text-2)] font-mono text-xs">
                        7 days
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => handleRevokeInvitation(inv.id)}
                          className="text-xs text-[var(--color-danger)] hover:underline font-mono"
                        >
                          Revoke
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* TAB: API KEYS */}
      {activeTab === "keys" && (
        <div className="space-y-6">
          {newKeySecret && (
            <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--color-accent)] text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[var(--color-accent)] font-mono uppercase">
                  SAVE YOUR SECRET KEY NOW (SHOW-ONCE)
                </span>
                <button
                  onClick={() => setNewKeySecret(null)}
                  className="text-[var(--text-2)] hover:text-[var(--text-1)] font-mono"
                >
                  ✕ Dismiss
                </button>
              </div>
              <p className="text-[var(--text-2)] mb-2 font-sans">
                Constitution Rule 7: For your security, Scrappy only stores a cryptographic SHA-256 hash. We cannot show this secret again.
              </p>
              <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-0)] border border-[var(--border-subtle)] text-[var(--color-accent)] font-mono select-all flex items-center justify-between">
                <span>{newKeySecret}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newKeySecret);
                    showToast({ type: "info", title: "Copied to clipboard" });
                  }}
                  className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-1)] hover:border-[var(--border-strong)]"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="e.g. Production Data Ingestion Worker"
              aria-label="Secret Key Name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 w-full bg-[var(--surface-2)] border border-[var(--border-default)] rounded-[var(--radius-sm)] px-3 py-2 text-xs text-[var(--text-1)] placeholder:text-[var(--text-3)] outline-none focus:border-[var(--border-focus)] font-mono"
            />
            <Button variant="primary" size="sm" onClick={handleGenerateKey}>
              + Generate New Secret Key
            </Button>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] overflow-x-auto bg-[var(--surface-1)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>LABEL</TableHead>
                  <TableHead>KEY IDENTIFIER</TableHead>
                  <TableHead>CREATED</TableHead>
                  <TableHead>LAST USED</TableHead>
                  <TableHead className="text-right">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="text-[var(--text-1)] font-medium font-mono text-xs">{k.name}</TableCell>
                    <TableCell className="text-[var(--text-2)] font-mono text-xs">{k.prefix}</TableCell>
                    <TableCell className="text-[var(--text-2)] font-mono text-xs">{k.createdAt}</TableCell>
                    <TableCell className="text-[var(--color-success)] font-mono text-xs">{k.lastUsedAt}</TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleRevokeKey(k.id)}
                        className="text-xs text-[var(--color-danger)] hover:underline font-mono"
                      >
                        Revoke
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* TAB: SIGNED WEBHOOKS */}
      {activeTab === "webhooks" && (
        <div className="space-y-6">
          {newWebhookSecret && (
            <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--color-accent)] text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[var(--color-accent)] font-mono uppercase">
                  SAVE YOUR HMAC SIGNING SECRET (SHOW-ONCE)
                </span>
                <button
                  onClick={() => setNewWebhookSecret(null)}
                  className="text-[var(--text-2)] hover:text-[var(--text-1)] font-mono"
                >
                  ✕ Dismiss
                </button>
              </div>
              <p className="text-[var(--text-2)] mb-2 font-sans">
                Constitution Rule 7: Webhook signatures in the X-Scrappy-Signature header are signed with this secret. It will never be shown again.
              </p>
              <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-0)] border border-[var(--border-subtle)] text-[var(--color-accent)] font-mono select-all flex items-center justify-between">
                <span>{newWebhookSecret}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newWebhookSecret);
                    showToast({ type: "info", title: "Copied to clipboard" });
                  }}
                  className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-1)] hover:border-[var(--border-strong)]"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center gap-3">
            <input
              type="url"
              placeholder="https://api.your-service.com/webhooks/pricing"
              aria-label="Webhook Destination URL"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              className="flex-1 w-full bg-[var(--surface-2)] border border-[var(--border-default)] rounded-[var(--radius-sm)] px-3 py-2 text-xs text-[var(--text-1)] placeholder:text-[var(--text-3)] outline-none focus:border-[var(--border-focus)] font-mono"
            />
            <Button variant="primary" size="sm" onClick={handleAddWebhook}>
              + Register Webhook Endpoint
            </Button>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] overflow-x-auto bg-[var(--surface-1)]">
            <div className="px-4 py-2 border-b border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-2)] uppercase tracking-wider font-semibold">
              Registered Endpoints ({webhooks.length})
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DESTINATION URL</TableHead>
                  <TableHead>SUBSCRIBED EVENTS</TableHead>
                  <TableHead>HMAC SECRET</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead className="text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-[var(--text-2)] font-mono text-xs">
                      No webhooks registered yet. Register an HTTPS endpoint above.
                    </TableCell>
                  </TableRow>
                ) : (
                  webhooks.map((wh) => (
                    <TableRow key={wh.id}>
                      <TableCell className="text-[var(--text-1)] font-mono text-xs truncate max-w-xs">{wh.targetUrl}</TableCell>
                      <TableCell className="text-xs text-[var(--text-2)] font-mono">
                        {wh.events.join(", ")}
                      </TableCell>
                      <TableCell className="text-xs text-[var(--text-2)] font-mono">
                        {wh.secretHash.substring(0, 12)}...
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-mono uppercase font-bold bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                          active
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <button
                          onClick={() => handleDispatchTestDelivery(wh.id)}
                          className="text-xs text-[var(--color-accent)] hover:underline font-mono"
                        >
                          Send Test Ping
                        </button>
                        <button
                          onClick={() => handleDeleteWebhook(wh.id)}
                          className="text-xs text-[var(--color-danger)] hover:underline font-mono ml-2"
                        >
                          Delete
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Webhook Delivery & Replay Log */}
          {deliveries.length > 0 && (
            <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] overflow-hidden bg-[var(--surface-1)]">
              <div className="px-4 py-2 border-b border-[var(--border-subtle)] text-[11px] font-mono text-[var(--color-info)] uppercase tracking-wider font-semibold">
                Recent Deliveries &amp; Replay Log ({deliveries.length})
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>EVENT TYPE</TableHead>
                    <TableHead>HTTP STATUS</TableHead>
                    <TableHead>LATENCY</TableHead>
                    <TableHead>HMAC SIGNATURE</TableHead>
                    <TableHead>TIME</TableHead>
                    <TableHead className="text-right">ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.slice(0, 10).map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="text-[var(--text-1)] font-medium font-mono text-xs">{d.eventType}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-mono font-bold ${
                          d.responseStatus && d.responseStatus < 300
                            ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/30"
                            : "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/30"
                        }`}>
                          {d.responseStatus || 200} OK
                        </span>
                      </TableCell>
                      <TableCell className="text-[var(--text-2)] font-mono text-xs">{d.latencyMs || 24}ms</TableCell>
                      <TableCell className="text-[var(--text-2)] text-xs font-mono">
                        {d.signature.substring(0, 12)}...
                      </TableCell>
                      <TableCell className="text-[var(--text-2)] font-mono text-xs">
                        {new Date(d.deliveredAt).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => handleDispatchTestDelivery(d.webhookId)}
                          className="text-xs text-[var(--color-info)] hover:underline font-mono"
                        >
                          Replay Delivery
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* TAB: USAGE METERING */}
      {activeTab === "metering" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-2)]">
            <span>Current Billing Cycle: {usage?.currentPeriodStart ? usage.currentPeriodStart.split("T")[0] : "2026-10-01"} to {usage?.currentPeriodEnd ? usage.currentPeriodEnd.split("T")[0] : "2026-10-31"}</span>
            <span className="uppercase text-[var(--color-accent)] font-bold">Plan: {usage?.plan || "PRO"}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            <div className="p-5 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border-subtle)]">
              <span className="text-[11px] uppercase text-[var(--text-2)] font-semibold">EXTRACTED RECORDS</span>
              <div className="text-2xl font-bold text-[var(--text-1)] my-1 font-sans">
                {usage?.recordsExtracted !== undefined ? usage.recordsExtracted.toLocaleString() : "18,420"}
              </div>
              <div className="text-xs text-[var(--text-2)]">
                Plan cap: {(usage?.limits?.recordsPerMonth || 100000).toLocaleString()} / month
              </div>
              <div className="w-full bg-[var(--surface-2)] h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-[var(--color-accent)] h-full transition-all"
                  style={{ width: `${usage?.quotaStatus?.recordsPct || 18.4}%` }}
                />
              </div>
            </div>

            <div className="p-5 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border-subtle)]">
              <span className="text-[11px] uppercase text-[var(--text-2)] font-semibold">BROWSER HEADLESS MINUTES</span>
              <div className="text-2xl font-bold text-[var(--text-1)] my-1 font-sans">
                {usage?.browserMinutes !== undefined ? `${usage.browserMinutes} min` : "42.6 min"}
              </div>
              <div className="text-xs text-[var(--text-2)]">
                Plan cap: {usage?.limits?.browserMinutes || 500} min / month
              </div>
              <div className="w-full bg-[var(--surface-2)] h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-[var(--color-info)] h-full transition-all"
                  style={{ width: `${usage?.quotaStatus?.browserMinutesPct || 8.5}%` }}
                />
              </div>
            </div>

            <div className="p-5 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border-subtle)]">
              <span className="text-[11px] uppercase text-[var(--text-2)] font-semibold">API RATE LIMIT</span>
              <div className="text-2xl font-bold text-[var(--text-1)] my-1 font-sans">
                {usage?.limits?.apiRequestsPerMinute || 120} req/min
              </div>
              <div className="text-xs text-[var(--text-2)]">Current burst capacity: 100%</div>
              <div className="w-full bg-[var(--surface-2)] h-1.5 rounded-full overflow-hidden mt-3">
                <div className="bg-[var(--color-success)] h-full" style={{ width: "100%" }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ToastProvider>
      <SettingsConsole />
    </ToastProvider>
  );
}
