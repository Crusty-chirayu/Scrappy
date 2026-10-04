"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "../../../lib/supabase-client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

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
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-[#141820] border border-[#262E3C] rounded-lg p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-xl font-mono font-bold text-white tracking-wide">
            Sign In to SCRAPPY
          </h1>
          <p className="text-xs text-[#98A2B3] mt-1 font-mono">
            Precision data instrument: Compare, Intelligence, and Extract
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#262E3C] mb-6 font-mono text-xs">
          <button
            type="button"
            id="tab-password"
            onClick={() => {
              setMode("password");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-center border-b-2 transition-colors ${
              mode === "password"
                ? "border-[#C6F135] text-[#C6F135] font-semibold"
                : "border-transparent text-[#98A2B3] hover:text-white"
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
            className={`flex-1 py-2 text-center border-b-2 transition-colors ${
              mode === "magic"
                ? "border-[#C6F135] text-[#C6F135] font-semibold"
                : "border-transparent text-[#98A2B3] hover:text-white"
            }`}
          >
            Magic Link
          </button>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-4 p-3 bg-[#F43F5E]/10 border border-[#F43F5E]/30 rounded text-xs text-[#F43F5E] font-mono"
          >
            {errorMsg}
          </div>
        )}

        {magicSent ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-[#C6F135]/10 text-[#C6F135] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-white mb-1">Check your email</h2>
            <p className="text-xs text-[#98A2B3] font-mono mb-4">
              We sent a temporary sign-in link to <span className="text-white">{email}</span>.
            </p>
            <button
              type="button"
              onClick={() => setMagicSent(false)}
              className="text-xs text-[#C6F135] font-mono hover:underline"
            >
              Use a different email or sign in with password
            </button>
          </div>
        ) : mode === "password" ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-mono text-[#98A2B3] mb-1">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-[#0A0C0F] border border-[#262E3C] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6F135] font-mono"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-mono text-[#98A2B3] mb-1"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0A0C0F] border border-[#262E3C] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6F135] font-mono"
              />
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#C6F135] text-black font-semibold text-xs rounded hover:bg-[#b2dc29] transition-colors disabled:opacity-50 font-mono tracking-wide"
            >
              {loading ? "Signing In..." : "Sign In with Password"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label htmlFor="magic-email" className="block text-xs font-mono text-[#98A2B3] mb-1">
                Work Email Address
              </label>
              <input
                id="magic-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-[#0A0C0F] border border-[#262E3C] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6F135] font-mono"
              />
            </div>

            <button
              type="submit"
              id="magic-submit-btn"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#C6F135] text-black font-semibold text-xs rounded hover:bg-[#b2dc29] transition-colors disabled:opacity-50 font-mono tracking-wide"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-[#262E3C] text-center text-xs text-[#98A2B3] font-mono">
          Don&apos;t have an account?{" "}
          <a
            href="/auth/signup"
            id="to-signup-link"
            className="text-[#C6F135] hover:underline font-semibold"
          >
            Create Workspace
          </a>
        </div>
      </div>
    </div>
  );
}
