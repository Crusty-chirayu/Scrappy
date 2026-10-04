"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "../../../lib/supabase-client";

export default function SignupPage() {
  const router = useRouter();
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
      // Direct session granted
      router.push("/compare");
      router.refresh();
      return;
    }

    // Confirmation email sent or pending
    setSuccess(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-[#141820] border border-[#262E3C] rounded-lg p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-xl font-mono font-bold text-white tracking-wide">
            Create SCRAPPY Workspace
          </h1>
          <p className="text-xs text-[#98A2B3] mt-1 font-mono">
            Get your isolated workspace with multi-merchant price tracking
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-4 p-3 bg-[#F43F5E]/10 border border-[#F43F5E]/30 rounded text-xs text-[#F43F5E] font-mono"
          >
            {errorMsg}
          </div>
        )}

        {success ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-[#C6F135]/10 text-[#C6F135] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-white mb-1">Account Created</h2>
            <p className="text-xs text-[#98A2B3] font-mono mb-6">
              Your personal workspace was auto-provisioned. You can now sign in with your credentials.
            </p>
            <a
              href="/auth/login"
              id="signup-success-login-btn"
              className="inline-block py-2.5 px-6 bg-[#C6F135] text-black font-semibold text-xs rounded hover:bg-[#b2dc29] transition-colors font-mono"
            >
              Go to Sign In
            </a>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="signup-name" className="block text-xs font-mono text-[#98A2B3] mb-1">
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-[#0A0C0F] border border-[#262E3C] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6F135] font-mono"
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-xs font-mono text-[#98A2B3] mb-1">
                Work Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                className="w-full bg-[#0A0C0F] border border-[#262E3C] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6F135] font-mono"
              />
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="block text-xs font-mono text-[#98A2B3] mb-1"
              >
                Password (min 8 characters)
              </label>
              <input
                id="signup-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0A0C0F] border border-[#262E3C] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6F135] font-mono"
              />
            </div>

            <div>
              <label
                htmlFor="signup-confirm-password"
                className="block text-xs font-mono text-[#98A2B3] mb-1"
              >
                Confirm Password
              </label>
              <input
                id="signup-confirm-password"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0A0C0F] border border-[#262E3C] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6F135] font-mono"
              />
            </div>

            <button
              type="submit"
              id="signup-submit-btn"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#C6F135] text-black font-semibold text-xs rounded hover:bg-[#b2dc29] transition-colors disabled:opacity-50 font-mono tracking-wide"
            >
              {loading ? "Creating Account..." : "Create Account & Workspace"}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-[#262E3C] text-center text-xs text-[#98A2B3] font-mono">
          Already have an account?{" "}
          <a
            href="/auth/login"
            id="to-login-link"
            className="text-[#C6F135] hover:underline font-semibold"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
