"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "../../../lib/supabase-client";
import { Button } from "@scrappy/ui";
import { UserPlus, ArrowRight, Check } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const supabase = getBrowserSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data.session) {
      window.location.href = "/compare";
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] text-xs font-mono font-medium mb-3">
            <UserPlus size={12} />
            <span>NEW WORKSPACE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-[var(--text-1)] tracking-tight">
            Create SCRAPPY Workspace
          </h1>
          <p className="text-xs text-[var(--text-3)] mt-2 font-mono">
            Get your isolated workspace with multi-merchant price tracking
          </p>
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

        {success ? (
          <div className="p-6 bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 rounded-xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[var(--color-success)]/20 text-[var(--color-success)] mx-auto flex items-center justify-center font-bold text-lg">
              <Check size={20} />
            </div>
            <h2 className="text-sm font-mono font-bold text-[var(--text-1)]">
              Workspace Created
            </h2>
            <p className="text-xs text-[var(--text-3)] font-mono">
              We sent a verification confirmation to <strong className="text-[var(--text-1)]">{email}</strong>.
            </p>
            <div className="pt-2">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-xs font-mono font-semibold min-h-[44px] hover:opacity-90 transition-opacity"
              >
                <span>Continue to Onboarding</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label
                htmlFor="signup-name"
                className="block text-xs font-mono text-[var(--text-2)] mb-1.5 font-medium"
              >
                FULL NAME
              </label>
              <input
                id="signup-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ada Lovelace"
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-1)] font-mono outline-none focus:border-[var(--color-accent)] min-h-[44px]"
              />
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="block text-xs font-mono text-[var(--text-2)] mb-1.5 font-medium"
              >
                WORK EMAIL
              </label>
              <input
                id="signup-email"
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
                htmlFor="signup-password"
                className="block text-xs font-mono text-[var(--text-2)] mb-1.5 font-medium"
              >
                PASSWORD (MIN 8 CHARACTERS)
              </label>
              <input
                id="signup-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-1)] font-mono outline-none focus:border-[var(--color-accent)] min-h-[44px]"
              />
            </div>

            <div>
              <label
                htmlFor="signup-confirm-password"
                className="block text-xs font-mono text-[var(--text-2)] mb-1.5 font-medium"
              >
                CONFIRM PASSWORD
              </label>
              <input
                id="signup-confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-1)] font-mono outline-none focus:border-[var(--color-accent)] min-h-[44px]"
              />
            </div>

            <Button
              id="signup-submit-btn"
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full min-h-[44px] text-xs font-mono font-semibold gap-1.5 justify-center"
            >
              <span>{loading ? "Provisioning Workspace..." : "Create Free Workspace"}</span>
              <ArrowRight size={14} />
            </Button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-center text-xs font-mono text-[var(--text-3)]">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-[var(--color-accent)] hover:underline font-semibold"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
