"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "../../../lib/supabase-client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getBrowserSupabase();

    // Check for hash or code in URL
    const hash = window.location.hash;
    const search = window.location.search;

    if (hash || search) {
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          setErrorMsg(error.message);
          return;
        }
        if (session) {
          router.replace("/compare");
        } else {
          router.replace("/auth/login");
        }
      });
    } else {
      router.replace("/auth/login");
    }
  }, [router]);

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-[var(--radius-lg)] p-8 shadow-[var(--elevation-2)]">
        {errorMsg ? (
          <div role="alert" className="text-xs text-[var(--color-danger)] font-mono">
            <p className="font-semibold mb-2">Authentication Error</p>
            <p>{errorMsg}</p>
            <a href="/auth/login" className="inline-block mt-4 text-[var(--color-accent)] underline">
              Return to Login
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <span className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-[var(--text-3)]">Authenticating session...</p>
          </div>
        )}
      </div>
    </div>
  );
}
