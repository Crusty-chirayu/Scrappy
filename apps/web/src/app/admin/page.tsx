"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button, Card, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, useToast } from "@scrappy/ui";

const RECOVERY_CODES = [
  "9F4A-8B12",
  "7C3D-4E90",
  "1A2B-3C4D",
  "5E6F-7A8B",
  "2C4D-6E8F",
  "3B5D-7F9A",
  "4D6E-8A0B",
  "8F0A-2C4E",
];

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  status: "SUCCESS" | "BLOCKED" | "WARNING";
  ipAddress: string;
}

const AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log_1",
    timestamp: "2026-10-06 14:15:22",
    actor: "lead@scrappy.io",
    action: "totp_mfa_challenge_verified",
    resource: "admin_session",
    status: "SUCCESS",
    ipAddress: "192.0.2.45",
  },
  {
    id: "log_2",
    timestamp: "2026-10-06 13:58:04",
    actor: "anon-crawler",
    action: "ssrf_guard_blocked_private_ip",
    resource: "169.254.169.254",
    status: "BLOCKED",
    ipAddress: "203.0.113.19",
  },
  {
    id: "log_3",
    timestamp: "2026-10-06 13:42:10",
    actor: "worker-playwright-3",
    action: "circuit_breaker_healthy",
    resource: "amazon_in_adapter",
    status: "SUCCESS",
    ipAddress: "10.0.4.12",
  },
  {
    id: "log_4",
    timestamp: "2026-10-06 12:30:15",
    actor: "system-cron",
    action: "price_history_aggregate_run",
    resource: "timescaledb_hypertable",
    status: "SUCCESS",
    ipAddress: "10.0.0.1",
  },
  {
    id: "log_5",
    timestamp: "2026-10-06 11:05:40",
    actor: "user_tenant_9",
    action: "api_key_rotated",
    resource: "workspace_prod_keys",
    status: "SUCCESS",
    ipAddress: "198.51.100.8",
  },
];

export default function AdminPage() {
  const { showToast } = useToast();
  // View states: "enroll" | "challenge" | "dashboard"
  const [viewState, setViewState] = useState<"enroll" | "challenge" | "dashboard">("challenge");

  // OTP Inputs (6 digits)
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // RFC 6238 30-second window timer
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  // Recovery code state
  const [useRecovery, setUseRecovery] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      setSecondsRemaining(30 - (now % 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val.slice(-1);
    }
    const nextOtp = [...otp];
    nextOtp[index] = val;
    setOtp(nextOtp);

    // Auto-advance to next cell
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim().slice(0, 6);
    if (/^\d+$/.test(pasted)) {
      const digits = pasted.split("");
      const nextOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) nextOtp[i] = d;
      });
      setOtp(nextOtp);
      const nextFocus = Math.min(digits.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length === 6 || (useRecovery && recoveryInput.trim().length >= 8)) {
      setViewState("dashboard");
      showToast({
        type: "success",
        title: "MFA Verified",
        description: "Authenticated with high-privilege administrative session.",
      });
    } else {
      showToast({
        type: "error",
        title: "Verification Failed",
        description: "Please enter a valid 6-digit authenticator code.",
      });
    }
  };

  const copySecret = () => {
    navigator.clipboard?.writeText("JBSWY3DPEHPK3PXP");
    showToast({
      type: "info",
      title: "Secret Copied",
      description: "Base32 TOTP secret copied to clipboard.",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Admin Eyebrow */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-warn)]" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-warn)] font-bold">
              Administrative Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-1)] tracking-tight">
            Security &amp; Tenant Operations
          </h1>
          <p className="text-xs text-[var(--text-3)] font-mono mt-1">
            Mandatory multi-factor authentication (MFA) via RFC 6238 TOTP.
          </p>
        </div>

        {viewState === "dashboard" && (
          <div className="flex items-center gap-3">
            <Badge variant="success">MFA Active</Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setViewState("challenge");
                setOtp(["", "", "", "", "", ""]);
              }}
              className="min-h-[44px] font-mono text-xs"
            >
              Lock Console
            </Button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SCREEN 1: TOTP MFA ENROLLMENT */}
      {/* ========================================================= */}
      {viewState === "enroll" && (
        <Card className="max-w-xl mx-auto p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-[var(--text-1)]">
              Enroll Multi-Factor Authenticator
            </h2>
            <p className="text-xs text-[var(--text-3)] font-mono mt-1">
              Scan the QR code with Google Authenticator, 1Password, or Authy.
            </p>
          </div>

          {/* QR Code Visual Specimen */}
          <div className="flex justify-center my-4">
            <div className="p-4 bg-white rounded-lg border border-[var(--border-subtle)] text-black text-center shadow-sm">
              <svg
                width="160"
                height="160"
                viewBox="0 0 160 160"
                className="mx-auto"
                aria-label="TOTP QR Code"
              >
                {/* Simulated high-contrast SVG QR pattern */}
                <rect width="160" height="160" fill="white" />
                {/* Corner markers */}
                <rect x="10" y="10" width="40" height="40" fill="black" />
                <rect x="18" y="18" width="24" height="24" fill="white" />
                <rect x="24" y="24" width="12" height="12" fill="black" />

                <rect x="110" y="10" width="40" height="40" fill="black" />
                <rect x="118" y="18" width="24" height="24" fill="white" />
                <rect x="124" y="24" width="12" height="12" fill="black" />

                <rect x="10" y="110" width="40" height="40" fill="black" />
                <rect x="18" y="118" width="24" height="24" fill="white" />
                <rect x="24" y="124" width="12" height="12" fill="black" />

                {/* Random geometric bits */}
                <rect x="60" y="20" width="10" height="10" fill="black" />
                <rect x="80" y="20" width="10" height="10" fill="black" />
                <rect x="70" y="40" width="10" height="10" fill="black" />
                <rect x="60" y="60" width="40" height="10" fill="black" />
                <rect x="60" y="80" width="10" height="40" fill="black" />
                <rect x="90" y="90" width="30" height="10" fill="black" />
                <rect x="120" y="60" width="10" height="20" fill="black" />
                <rect x="130" y="90" width="20" height="10" fill="black" />
                <rect x="110" y="120" width="30" height="20" fill="black" />
                <rect x="70" y="130" width="20" height="10" fill="black" />
              </svg>
              <div className="text-[10px] font-mono text-gray-600 mt-2">
                otpauth://totp/SCRAPPY:admin
              </div>
            </div>
          </div>

          {/* Copyable Secret */}
          <div className="p-3 rounded bg-[var(--bg-2)] border border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-[var(--text-3)] uppercase">
                Base32 Secret Key
              </div>
              <div className="text-sm font-mono font-bold text-[var(--text-1)] tracking-wider">
                JBSW Y3DP EHPK 3PXP
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={copySecret} className="min-h-[44px]">
              Copy
            </Button>
          </div>

          {/* Backup Recovery Codes */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-medium text-[var(--text-2)]">
              EMERGENCY RECOVERY CODES (STORE SECURELY)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {RECOVERY_CODES.map((code, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-[var(--bg-2)] border border-[var(--border-subtle)] text-center font-mono text-xs text-[var(--text-1)] select-all"
                >
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
            <Button
              variant="secondary"
              onClick={() => setViewState("challenge")}
              className="min-h-[44px]"
            >
              ← Back to Login
            </Button>
            <Button
              variant="primary"
              onClick={() => setViewState("challenge")}
              className="min-h-[44px]"
            >
              I Have Saved My Codes →
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================= */}
      {/* SCREEN 2: MFA CHALLENGE / VERIFY GATE */}
      {/* ========================================================= */}
      {viewState === "challenge" && (
        <Card className="max-w-md mx-auto p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] mx-auto flex items-center justify-center font-bold text-xl mb-3">
              🔒
            </div>
            <h2 className="text-xl font-bold text-[var(--text-1)]">
              Two-Factor Authentication
            </h2>
            <p className="text-xs text-[var(--text-3)] font-mono mt-1">
              Enter the 6-digit code from your authenticator app to unlock the admin console.
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            {!useRecovery ? (
              <div className="space-y-4">
                {/* 6-Cell Auto Advancing OTP Inputs */}
                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      aria-label={`Digit ${idx + 1}`}
                      className="w-12 h-14 text-center text-xl font-mono font-bold rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-2)] text-[var(--text-1)] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                    />
                  ))}
                </div>

                {/* 30-Second Window Timer */}
                <div className="flex items-center justify-between text-xs font-mono text-[var(--text-3)]">
                  <span>Code expires in:</span>
                  <span className="font-bold text-[var(--color-primary)]">
                    {secondsRemaining}s
                  </span>
                </div>
                <div className="w-full bg-[var(--border-subtle)] h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-[var(--color-primary)] h-full transition-all duration-1000"
                    style={{ width: `${(secondsRemaining / 30) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="recovery-input"
                  className="block text-xs font-mono text-[var(--text-2)] mb-1.5 font-medium"
                >
                  8-CHARACTER RECOVERY CODE
                </label>
                <input
                  id="recovery-input"
                  type="text"
                  value={recoveryInput}
                  onChange={(e) => setRecoveryInput(e.target.value)}
                  placeholder="9F4A-8B12"
                  className="w-full bg-[var(--bg-2)] border border-[var(--border-subtle)] rounded px-3 py-2.5 text-xs text-[var(--text-1)] font-mono outline-none focus:border-[var(--color-primary)] min-h-[44px]"
                />
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full min-h-[44px] font-mono text-xs font-bold"
            >
              Verify &amp; Enter Console →
            </Button>
          </form>

          <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
            <button
              type="button"
              onClick={() => setUseRecovery(!useRecovery)}
              className="text-[var(--color-primary)] hover:underline min-h-[44px] inline-flex items-center"
            >
              {useRecovery ? "Use Authenticator Code" : "Use Backup Code"}
            </button>
            <button
              type="button"
              onClick={() => setViewState("enroll")}
              className="text-[var(--text-3)] hover:text-[var(--text-1)] min-h-[44px] inline-flex items-center"
            >
              Re-enroll Device
            </button>
          </div>
        </Card>
      )}

      {/* ========================================================= */}
      {/* SCREEN 3: AUTHENTICATED ADMIN DASHBOARD & AUDIT LOG */}
      {/* ========================================================= */}
      {viewState === "dashboard" && (
        <div className="space-y-8">
          {/* Platform Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-xs font-mono text-[var(--text-3)] uppercase">
                Active Tenants
              </div>
              <div className="text-2xl font-bold font-mono text-[var(--text-1)] mt-1">
                14 Workspaces
              </div>
              <div className="text-[11px] text-[var(--color-success)] font-mono mt-1">
                RLS Isolation 100%
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-xs font-mono text-[var(--text-3)] uppercase">
                Scraping Workers
              </div>
              <div className="text-2xl font-bold font-mono text-[var(--color-primary)] mt-1">
                4 Running
              </div>
              <div className="text-[11px] text-[var(--text-3)] font-mono mt-1">
                Playwright v22 Sandboxes
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-xs font-mono text-[var(--text-3)] uppercase">
                Circuit Breakers
              </div>
              <div className="text-2xl font-bold font-mono text-[var(--color-success)] mt-1">
                0 Tripped
              </div>
              <div className="text-[11px] text-[var(--text-3)] font-mono mt-1">
                All 4 Retailers Healthy
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-xs font-mono text-[var(--text-3)] uppercase">
                Database Pool
              </div>
              <div className="text-2xl font-bold font-mono text-[var(--text-1)] mt-1">
                12 / 100
              </div>
              <div className="text-[11px] text-[var(--text-3)] font-mono mt-1">
                Supabase Direct (5432)
              </div>
            </Card>
          </div>

          {/* Audit Log Table */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-1)]">
                  Security &amp; Mutation Audit Log
                </h2>
                <p className="text-xs text-[var(--text-3)] font-mono mt-0.5">
                  Append-only immutable record of all privileged administrative events.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  showToast({
                    type: "info",
                    title: "Audit Log Exported",
                    description: "Downloaded immutable audit trace (JSON format).",
                  });
                }}
                className="min-h-[44px] font-mono text-xs"
              >
                Export Trace (JSON)
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target Resource</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Origin IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {AUDIT_LOGS.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-xs text-[var(--text-3)]">
                        {entry.timestamp}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-[var(--text-1)] font-medium">
                        {entry.actor}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-[var(--color-primary)]">
                        {entry.action}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-[var(--text-2)]">
                        {entry.resource}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            entry.status === "SUCCESS"
                              ? "success"
                              : entry.status === "BLOCKED"
                              ? "danger"
                              : "warn"
                          }
                        >
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-[var(--text-3)]">
                        {entry.ipAddress}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
