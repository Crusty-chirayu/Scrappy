"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "../../../lib/supabase-client";
import { Button } from "@scrappy/ui";
import { Shield, KeyRound, Mail, ArrowRight, Check } from "lucide-react";

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
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] text-xs font-mono font-medium mb-3">
            <Shield size={12} />
            <span>SECURE ACCESS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-[var(--text-1)] tracking-tight">
            Sign In to SCRAPPY
          </h1>
          <p className="text-xs text-[var(--text-3)] mt-2 font-mono">
            Compare, Intelligence, and Extract on one unified platform
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[var(--surface-2)] p-1 rounded-xl mb-6 font-mono text-xs border border-[var(--border-subtle)]">
          <button
            type="button"
            id="tab-password"
            onClick={() => {
              setMode("password");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-center rounded-lg transition-all min-h-[36px] flex items-center justify-center gap-1.5 ${
              mode === "password"
                ? "bg-[var(--surface-1)] text-[var(--text-1)] font-semibold shadow-xs"
                : "text-[var(--text-3)] hover:text-[var(--text-1)]"
            }`}
          >
            <KeyRound size={13} />
            <span>Password</span>
          </button>
          <button
            type="button"
            id="tab-magic"
            onClick={() => {
              setMode("magic");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-center rounded-lg transition-all min-h-[36px] flex items-center justify-center gap-1.5 ${
              mode === "magic"
                ? "bg-[var(--surface-1)] text-[var(--text-1)] font-semibold shadow-xs"
                : "text-[var(--text-3)] hover:text-[var(--text-1)]"
            }`}
          >
            <Mail size={13} />
            <span>Magic Link</span>
          </button>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-4 p-3 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded-xl text-xs text-[var(--color-danger)] font-mono flex items-start gap-2"
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
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-1)] font-mono outline-none focus:border-[var(--color-accent)] min-h-[44px]"
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
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-1)] font-mono outline-none focus:border-[var(--color-accent)] min-h-[44px]"
              />
            </div>

            <Button
              id="login-submit-btn"
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full min-h-[44px] text-xs font-mono font-semibold gap-1.5 justify-center"
            >
              <span>{loading ? "Authenticating..." : "Sign In"}</span>
              <ArrowRight size={14} />
            </Button>
          </form>
        )}

        {mode === "magic" && (
          <div>
            {magicSent ? (
              <div className="p-5 bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 rounded-xl text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-success)]/20 text-[var(--color-success)] mx-auto flex items-center justify-center font-bold">
                  <Check size={18} />
                </div>
                <h2 className="text-xs font-mono font-bold text-[var(--text-1)]">
                  Check your email
                </h2>
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
                    className="text-xs font-mono text-[var(--color-accent)] hover:underline min-h-[44px] inline-flex items-center"
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
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-1)] font-mono outline-none focus:border-[var(--color-accent)] min-h-[44px]"
                  />
                  <p className="text-[11px] text-[var(--text-3)] font-mono mt-1.5">
                    Passwordless authentication. We will email you a secure one-click link.
                  </p>
                </div>

                <Button
                  id="magic-submit-btn"
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full min-h-[44px] text-xs font-mono font-semibold gap-1.5 justify-center"
                >
                  <span>{loading ? "Sending Link..." : "Send Magic Link"}</span>
                  <ArrowRight size={14} />
                </Button>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-center text-xs font-mono text-[var(--text-3)]">
          Need an account?{" "}
          <Link
            href="/auth/signup"
            className="text-[var(--color-accent)] hover:underline font-semibold"
          >
            Create workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
