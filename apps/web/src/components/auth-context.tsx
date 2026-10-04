"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { getBrowserSupabase } from "../lib/supabase-client";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (ws: Workspace) => void;
  refreshWorkspaces: () => Promise<void>;
  logout: () => Promise<void>;
}

const DEFAULT_WORKSPACE: Workspace = {
  id: "e0000000-0000-0000-0000-000000000001",
  name: "Default Workspace",
  slug: "default",
  plan: "starter",
  role: "owner",
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  workspaces: [DEFAULT_WORKSPACE],
  activeWorkspace: DEFAULT_WORKSPACE,
  setActiveWorkspace: () => {},
  refreshWorkspaces: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([DEFAULT_WORKSPACE]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(DEFAULT_WORKSPACE);

  const fetchWorkspaces = useCallback(async (userId?: string) => {
    try {
      const url = userId ? `/api/workspaces?userId=${encodeURIComponent(userId)}` : "/api/workspaces";
      const res = await fetch(url);
      const data = await res.json();
      if (data.workspaces && data.workspaces.length > 0) {
        setWorkspaces(data.workspaces);
        setActiveWorkspace((prev) => {
          if (prev && data.workspaces.some((w: Workspace) => w.id === prev.id)) {
            return prev;
          }
          return data.workspaces[0];
        });
      }
    } catch {
      // Fallback to default
      setWorkspaces([DEFAULT_WORKSPACE]);
      setActiveWorkspace(DEFAULT_WORKSPACE);
    }
  }, []);

  useEffect(() => {
    const supabase = getBrowserSupabase();

    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      fetchWorkspaces(session?.user?.id).finally(() => {
        setIsLoading(false);
      });
    });

    // 2. Auth state subscription
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      await fetchWorkspaces(session?.user?.id);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchWorkspaces]);

  const logout = useCallback(async () => {
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setWorkspaces([DEFAULT_WORKSPACE]);
    setActiveWorkspace(DEFAULT_WORKSPACE);
  }, []);

  const refreshWorkspaces = useCallback(async () => {
    await fetchWorkspaces(user?.id);
  }, [fetchWorkspaces, user?.id]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        refreshWorkspaces,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
