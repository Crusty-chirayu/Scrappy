"use client";

import React, { useState } from "react";
import { Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, ToastProvider, useToast } from "@scrappy/ui";

interface TeamMember {
  id: string;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
  joinedAt: string;
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
  url: string;
  events: string[];
  secretPreview: string;
  status: "active" | "failing" | "disabled";
}

const INITIAL_MEMBERS: TeamMember[] = [
  { id: "m-1", email: "lead@scrappy.io", role: "owner", joinedAt: "2026-09-01" },
  { id: "m-2", email: "data-eng@scrappy.io", role: "admin", joinedAt: "2026-09-15" },
  { id: "m-3", email: "analyst@scrappy.io", role: "viewer", joinedAt: "2026-10-01" },
];

const INITIAL_KEYS: ApiKeyItem[] = [
  { id: "k-1", name: "Production Crawler Worker", prefix: "scrappy_live_9f82...", createdAt: "2026-09-20", lastUsedAt: "2m ago" },
  { id: "k-2", name: "Internal ETL Pipeline", prefix: "scrappy_live_3c17...", createdAt: "2026-09-28", lastUsedAt: "1h ago" },
];

const INITIAL_WEBHOOKS: WebhookItem[] = [
  {
    id: "wh-1",
    url: "https://api.merchant-gateway.internal/events/pricing",
    events: ["price.drop", "price.spike", "offer.out_of_stock"],
    secretPreview: "whsec_99a8b...",
    status: "active",
  },
  {
    id: "wh-2",
    url: "https://ops.merchant.internal/webhooks/scraper-drift",
    events: ["extractor.drift", "adapter.circuit_break"],
    secretPreview: "whsec_41f7e...",
    status: "active",
  },
];

function SettingsConsole() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"team" | "keys" | "webhooks" | "metering">("team");
  const [members] = useState(INITIAL_MEMBERS);
  const [keys, setKeys] = useState(INITIAL_KEYS);
  const [webhooks, setWebhooks] = useState(INITIAL_WEBHOOKS);

  // New key generator state
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");

  // New webhook state
  const [newWebhookUrl, setNewWebhookUrl] = useState("");

  const handleGenerateKey = () => {
    if (!newKeyName.trim()) {
      showToast({ type: "error", title: "Key name required", description: "Provide a descriptive label for the API key." });
      return;
    }
    const secret = `scrappy_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    const newEntry: ApiKeyItem = {
      id: `k-${Date.now()}`,
      name: newKeyName,
      prefix: `${secret.substring(0, 16)}...`,
      createdAt: new Date().toISOString().split("T")[0]!,
      lastUsedAt: "Never",
    };
    setKeys([newEntry, ...keys]);
    setNewKeySecret(secret);
    setNewKeyName("");
    showToast({ type: "success", title: "API Key Created", description: "Copy your key now. It will not be shown again." });
  };

  const handleRevokeKey = (id: string) => {
    setKeys(keys.filter((k) => k.id !== id));
    showToast({ type: "info", title: "API Key Revoked", description: "The key has been permanently invalidated." });
  };

  const handleAddWebhook = () => {
    if (!newWebhookUrl.trim() || !newWebhookUrl.startsWith("https://")) {
      showToast({ type: "error", title: "Valid HTTPS URL required", description: "Webhooks require secure HTTPS endpoints." });
      return;
    }
    const newEntry: WebhookItem = {
      id: `wh-${Date.now()}`,
      url: newWebhookUrl,
      events: ["price.drop", "extractor.drift"],
      secretPreview: `whsec_${Math.random().toString(36).substring(2, 8)}...`,
      status: "active",
    };
    setWebhooks([...webhooks, newEntry]);
    setNewWebhookUrl("");
    showToast({ type: "success", title: "Webhook Registered", description: "HMAC SHA-256 signing secret active." });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#C6F135]" />
            <span className="text-xs uppercase tracking-wider text-[#C6F135]">
              Workspace Tenancy &amp; Security
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#D6DBE3] font-sans">
            Workspace Settings
          </h1>
          <p className="text-xs text-[#98A2B3] mt-0.5">
            Manage team access, hashed API keys, signed HMAC webhooks, and metered usage.
          </p>
        </div>

        <div className="text-xs px-3 py-1.5 rounded bg-[#141922] border border-[#262E3C] text-[#98A2B3]">
          TENANT ID: <span className="text-white">ws-alpha-001</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262E3C] mb-6">
        <button
          onClick={() => setActiveTab("team")}
          className={`pb-3 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "team"
              ? "border-[#C6F135] text-white"
              : "border-transparent text-[#5B677C] hover:text-[#98A2B3]"
          }`}
        >
          TEAM &amp; ROLES ({members.length})
        </button>
        <button
          onClick={() => setActiveTab("keys")}
          className={`pb-3 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "keys"
              ? "border-[#C6F135] text-white"
              : "border-transparent text-[#5B677C] hover:text-[#98A2B3]"
          }`}
        >
          API KEYS ({keys.length})
        </button>
        <button
          onClick={() => setActiveTab("webhooks")}
          className={`pb-3 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "webhooks"
              ? "border-[#C6F135] text-white"
              : "border-transparent text-[#5B677C] hover:text-[#98A2B3]"
          }`}
        >
          SIGNED WEBHOOKS ({webhooks.length})
        </button>
        <button
          onClick={() => setActiveTab("metering")}
          className={`pb-3 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "metering"
              ? "border-[#C6F135] text-white"
              : "border-transparent text-[#5B677C] hover:text-[#98A2B3]"
          }`}
        >
          USAGE METERING
        </button>
      </div>

      {/* TAB: TEAM & ROLES */}
      {activeTab === "team" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#98A2B3]">
            <span>Role-Based Access Control enforced at Row Level Security layer.</span>
          </div>

          <div className="rounded-lg border border-[#262E3C] overflow-hidden bg-[#0F1217]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>USER EMAIL</TableHead>
                  <TableHead>WORKSPACE ROLE</TableHead>
                  <TableHead>JOINED</TableHead>
                  <TableHead>PERMISSIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-white font-medium">{m.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        m.role === "owner"
                          ? "bg-[#C6F135]/10 text-[#C6F135] border-[#C6F135]/30"
                          : m.role === "admin"
                          ? "bg-[#5AA9FF]/10 text-[#5AA9FF] border-[#5AA9FF]/30"
                          : "bg-[#141922] text-[#98A2B3] border-[#262E3C]"
                      }`}>
                        {m.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-[#5B677C] text-xs">{m.joinedAt}</TableCell>
                    <TableCell className="text-xs text-[#98A2B3]">
                      {m.role === "owner" ? "Full administrative + billing control" : m.role === "admin" ? "Can manage keys, scraping, monitors" : "Read-only access"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* TAB: API KEYS */}
      {activeTab === "keys" && (
        <div className="space-y-6">
          {/* Show-once Secret Banner */}
          {newKeySecret && (
            <div className="p-4 rounded-lg bg-[#14180F] border border-[#C6F135]/50 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[#C6F135] uppercase">
                  ⚠ SAVE YOUR SECRET KEY NOW (SHOW-ONCE)
                </span>
                <button
                  onClick={() => setNewKeySecret(null)}
                  className="text-[#5B677C] hover:text-white"
                >
                  ✕ Dismiss
                </button>
              </div>
              <p className="text-[#98A2B3] mb-2 font-sans">
                Constitution Rule 7: For your security, Scrappy only stores a cryptographic SHA-256 hash. We cannot show this secret again.
              </p>
              <div className="p-2.5 rounded bg-[#0A0C0F] border border-[#262E3C] text-[#C6F135] select-all flex items-center justify-between">
                <span>{newKeySecret}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newKeySecret);
                    showToast({ type: "info", title: "Copied to clipboard" });
                  }}
                  className="px-2 py-0.5 rounded bg-[#141922] border border-[#262E3C] text-[10px] hover:text-white"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Key Generator Form */}
          <div className="p-4 rounded-lg bg-[#0F1217] border border-[#262E3C] flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="e.g. Production Data Ingestion Worker"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 w-full bg-[#141922] border border-[#262E3C] rounded px-3 py-2 text-xs text-[#D6DBE3] outline-none focus:border-[#C6F135]"
            />
            <Button variant="primary" size="sm" onClick={handleGenerateKey}>
              + Generate New Secret Key
            </Button>
          </div>

          <div className="rounded-lg border border-[#262E3C] overflow-hidden bg-[#0F1217]">
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
                    <TableCell className="text-white font-medium">{k.name}</TableCell>
                    <TableCell className="text-[#98A2B3]">{k.prefix}</TableCell>
                    <TableCell className="text-[#5B677C] text-xs">{k.createdAt}</TableCell>
                    <TableCell className="text-[#C6F135] text-xs">{k.lastUsedAt}</TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleRevokeKey(k.id)}
                        className="text-xs text-[#FF5C5C] hover:underline"
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
          <div className="p-4 rounded-lg bg-[#0F1217] border border-[#262E3C] flex flex-col sm:flex-row items-center gap-3">
            <input
              type="url"
              placeholder="https://your-service.com/webhook"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              className="flex-1 w-full bg-[#141922] border border-[#262E3C] rounded px-3 py-2 text-xs text-[#D6DBE3] outline-none focus:border-[#C6F135]"
            />
            <Button variant="primary" size="sm" onClick={handleAddWebhook}>
              + Register Webhook Endpoint
            </Button>
          </div>

          <div className="rounded-lg border border-[#262E3C] overflow-hidden bg-[#0F1217]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DESTINATION URL</TableHead>
                  <TableHead>EVENTS</TableHead>
                  <TableHead>HMAC SECRET</TableHead>
                  <TableHead>STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((wh) => (
                  <TableRow key={wh.id}>
                    <TableCell className="text-white truncate max-w-xs">{wh.url}</TableCell>
                    <TableCell className="text-xs text-[#98A2B3]">
                      {wh.events.join(", ")}
                    </TableCell>
                    <TableCell className="text-xs text-[#5B677C]">{wh.secretPreview}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#2FBF8A]/10 text-[#2FBF8A] border border-[#2FBF8A]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2FBF8A]" />
                        {wh.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* TAB: USAGE METERING */}
      {activeTab === "metering" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-lg bg-[#0F1217] border border-[#262E3C]">
            <span className="text-[11px] uppercase text-[#5B677C]">EXTRACTED RECORDS</span>
            <div className="text-2xl font-bold text-white my-1 font-sans">18,420</div>
            <div className="text-xs text-[#98A2B3]">Plan cap: 100,000 / month</div>
            <div className="w-full bg-[#262E3C] h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-[#C6F135] h-full" style={{ width: "18.4%" }} />
            </div>
          </div>

          <div className="p-5 rounded-lg bg-[#0F1217] border border-[#262E3C]">
            <span className="text-[11px] uppercase text-[#5B677C]">BROWSER HEADLESS MINUTES</span>
            <div className="text-2xl font-bold text-white my-1 font-sans">42.6 min</div>
            <div className="text-xs text-[#98A2B3]">Plan cap: 500 min / month</div>
            <div className="w-full bg-[#262E3C] h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-[#9A7BFF] h-full" style={{ width: "8.5%" }} />
            </div>
          </div>

          <div className="p-5 rounded-lg bg-[#0F1217] border border-[#262E3C]">
            <span className="text-[11px] uppercase text-[#5B677C]">API REQUESTS</span>
            <div className="text-2xl font-bold text-white my-1 font-sans">94,180</div>
            <div className="text-xs text-[#98A2B3]">Rate limit: 120 req/min</div>
            <div className="w-full bg-[#262E3C] h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-[#5AA9FF] h-full" style={{ width: "31.4%" }} />
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
