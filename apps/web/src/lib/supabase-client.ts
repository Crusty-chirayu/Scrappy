import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:55321";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

/** Typed extension of globalThis for Supabase client singletons. */
declare global {
  var __scrappy_server_supabase__: SupabaseClient | undefined;
  var __scrappy_supabase_client__: SupabaseClient | undefined;
}

export function getBrowserSupabase(): SupabaseClient {
  if (typeof window === "undefined") {
    if (!globalThis.__scrappy_server_supabase__) {
      globalThis.__scrappy_server_supabase__ = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      });
    }
    return globalThis.__scrappy_server_supabase__;
  }

  if (!globalThis.__scrappy_supabase_client__) {
    globalThis.__scrappy_supabase_client__ = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return globalThis.__scrappy_supabase_client__;
}
