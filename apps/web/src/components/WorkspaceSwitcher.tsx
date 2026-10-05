"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth, Workspace } from "./auth-context";

export function WorkspaceSwitcher() {
  const { user, workspaces, activeWorkspace, setActiveWorkspace, logout, isLoading } =
    useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs font-mono text-[#98A2B3]">
        <span className="w-2 h-2 rounded-full bg-[#262E3C] animate-pulse" />
        <span>Loading...</span>
      </div>
    );
  }

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim() || !user) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, name: newWsName.trim() }),
      });
      const data = await res.json();
      if (data.workspace) {
        setActiveWorkspace(data.workspace);
        setShowCreateModal(false);
        setNewWsName("");
        window.location.reload();
      }
    } catch (err: unknown) {
      alert((err as Error)?.message || "Failed to create workspace");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative flex items-center gap-3" ref={dropdownRef}>
      {/* Workspace Switcher Button */}
      <button
        type="button"
        id="workspace-switcher-btn"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Switch active workspace"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1 text-xs font-mono bg-[var(--surface-1)] border border-[var(--border)] rounded hover:border-[var(--border-strong)] text-[var(--text-1)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--border-focus)]"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
        <span className="max-w-[130px] truncate font-medium">
          {activeWorkspace?.name || "Workspace"}
        </span>
        <span className="px-1 py-0.2 bg-[var(--surface-3)] text-[10px] text-[var(--color-accent)] uppercase rounded">
          {activeWorkspace?.plan || "free"}
        </span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Workspaces list"
          className="absolute right-0 top-full mt-1.5 w-64 bg-[#141820] border border-[#262E3C] rounded shadow-2xl py-1 z-50 text-xs"
        >
          <div className="px-3 py-1.5 text-[10px] font-mono text-[#98A2B3] uppercase tracking-wider border-b border-[#262E3C]">
            Workspaces ({workspaces.length})
          </div>

          <div className="max-h-48 overflow-y-auto py-1">
            {workspaces.map((ws: Workspace) => {
              const isSelected = ws.id === activeWorkspace?.id;
              return (
                <button
                  key={ws.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setActiveWorkspace(ws);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#1E2430] transition-colors ${
                    isSelected ? "text-[#C6F135] font-semibold bg-[#1E2430]/40" : "text-[#D6DBE3]"
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="truncate font-medium">{ws.name}</div>
                    <div className="text-[10px] text-[#98A2B3] font-mono">{ws.role}</div>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1 py-0.5 bg-[#262E3C] text-[#98A2B3] rounded">
                    {ws.plan}
                  </span>
                </button>
              );
            })}
          </div>

          {user && (
            <div className="border-t border-[#262E3C] p-1.5">
              <button
                type="button"
                id="create-workspace-btn"
                onClick={() => {
                  setIsOpen(false);
                  setShowCreateModal(true);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#1E2430] text-[#C6F135] font-mono text-[11px] flex items-center gap-1.5"
              >
                <span>+ Create New Workspace</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* User Login/Logout status */}
      {user ? (
        <div className="flex items-center gap-2 pl-2 border-l border-[#262E3C]">
          <span
            className="text-xs font-mono text-[#98A2B3] max-w-[120px] truncate"
            title={user.email}
          >
            {user.email}
          </span>
          <button
            type="button"
            id="auth-logout-btn"
            onClick={logout}
            className="text-xs font-mono text-[#F43F5E] hover:underline px-1.5 py-0.5 rounded hover:bg-[#F43F5E]/10"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 pl-2 border-l border-[var(--border)]">
          <a
            href="/auth/login"
            id="auth-login-link"
            className="text-xs font-mono text-[var(--color-accent)] hover:underline px-2.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--border)] hover:bg-[var(--surface-3)] transition-colors"
          >
            Sign In
          </a>
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141820] border border-[#262E3C] rounded-lg p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-semibold text-white mb-2">Create New Workspace</h3>
            <p className="text-xs text-[#98A2B3] mb-4">
              Team workspaces allow isolated watchlists, alerts, and extraction tasks.
            </p>
            <form onSubmit={handleCreateWorkspace}>
              <label htmlFor="ws-name-input" className="block text-xs font-mono text-[#98A2B3] mb-1">
                Workspace Name
              </label>
              <input
                id="ws-name-input"
                type="text"
                required
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                placeholder="e.g. Acme Pricing Team"
                className="w-full bg-[#0A0C0F] border border-[#262E3C] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6F135] mb-4 font-mono"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-[#98A2B3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-1.5 text-xs font-semibold bg-[#C6F135] text-black rounded hover:bg-[#b2dc29] disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
