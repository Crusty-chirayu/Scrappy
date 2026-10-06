"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "../../../lib/supabase-client";
import { Button } from "@scrappy/ui";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const supabase = getBrowserSupabase();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    router.push("/compare");
    router.refresh();
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownSeconds > 0) return;

    setLoading(true);
    setErrorMsg(null);

    const supabase = getBrowserSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setMagicSent(true);
    setCooldownSeconds(60);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-[var(--bg-1)] border border-[var(--border-subtle)] rounded-lg p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-primary)] font-bold">
              Secure Authentication
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-1)] tracking-tight">
            Sign In to SCRAPPY
          </h1>
          <p className="text-xs text-[var(--text-3)] mt-1.5 font-mono">
            Precision data instrument: Compare, Intelligence, and Extract
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[var(--border-subtle)] mb-6 font-mono text-xs">
          <button
            type="button"
            id="tab-password"
            onClick={() => {
              setMode("password");
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors min-h-[44px] ${
              mode === "password"
                ? "border-[var(--color-primary)] text-[var(--color-primary)] font-bold"
                : "border-transparent text-[var(--text-3)] hover:text-[var(--text-1)]"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            id="tab-magic"
            onClick={() => {
              setMode("magic");
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors min-h-[44px] ${
              mode === "magic"
                ? "border-[var(--color-primary)] text-[var(--color-primary)] font-bold"
                : "border-transparent text-[var(--text-3)] hover:text-[var(--text-1)]"
            }`}
          >
            Magic Link
          </button>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-4 p-3 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded text-xs text-[var(--color-danger)] font-mono flex items-start gap-2"
          >
            <span className="font-bold">✕</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {mode === "password" && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-mono text-[var(--text-2)] mb-1.5 font-medium"
              >
                EMAIL ADDRESS
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-[var(--bg-2)] border border-[var(--border-subtle)] rounded px-3 py-2.5 text-xs text-[var(--text-1)] font-mono outline-none focus:border-[var(--color-primary)] min-h-[44px]"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-mono text-[var(--text-2)] mb-1.5 font-medium"
              >
                PASSWORD
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--bg-2)] border border-[var(--border-subtle)] rounded px-3 py-2.5 text-xs text-[var(--text-1)] font-mono outline-none focus:border-[var(--color-primary)] min-h-[44px]"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full min-h-[44px] text-xs font-mono font-bold"
            >
              {loading ? "Authenticating..." : "Sign In →"}
            </Button>
          </form>
        )}

        {mode === "magic" && (
          <div>
            {magicSent ? (
              <div className="p-4 bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 rounded text-center space-y-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-success)]/20 text-[var(--color-success)] mx-auto flex items-center justify-center font-bold">
                  ✓
                </div>
                <div className="text-xs font-mono font-bold text-[var(--text-1)]">
                  Check your inbox
                </div>
                <p className="text-xs text-[var(--text-3)] font-mono">
                  We sent a temporary sign-in link to <strong className="text-[var(--text-1)]">{email}</strong>.
                </p>
                {cooldownSeconds > 0 ? (
                  <div className="text-[11px] text-[var(--text-3)] font-mono">
                    Resend link available in {cooldownSeconds}s
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleMagicLink}
                    className="text-xs font-mono text-[var(--color-primary)] hover:underline min-h-[44px] inline-flex items-center"
                  >
                    Resend Magic Link
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label
                    htmlFor="magic-email"
                    className="block text-xs font-mono text-[var(--text-2)] mb-1.5 font-medium"
                  >
                    WORK EMAIL
                  </label>
                  <input
                    id="magic-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-[var(--bg-2)] border border-[var(--border-subtle)] rounded px-3 py-2.5 text-xs text-[var(--text-1)] font-mono outline-none focus:border-[var(--color-primary)] min-h-[44px]"
                  />
                  <p className="text-[11px] text-[var(--text-3)] font-mono mt-1.5">
                    Passwordless authentication. We will email you a secure one-click link.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full min-h-[44px] text-xs font-mono font-bold"
                >
                  {loading ? "Sending Link..." : "Send Magic Link →"}
                </Button>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-center text-xs font-mono text-[var(--text-3)]">
          Need an account?{" "}
          <Link
            href="/auth/signup"
            className="text-[var(--color-primary)] hover:underline font-semibold"
          >
            Create workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
