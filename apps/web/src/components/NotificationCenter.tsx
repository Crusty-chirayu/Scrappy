"use client";

import React, { useState } from "react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: "price_drop" | "drift" | "competitor";
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "price_drop",
    title: "Price Drop: Apple iPhone 15 (128 GB)",
    description: "Dropped to ₹69,900 on Amazon.in (Saved ₹3,090).",
    timestamp: "12m ago",
    isRead: false,
    link: "/compare/prod-apple-iphone-15-128",
  },
  {
    id: "notif-2",
    type: "competitor",
    title: "Competitor Price Undercut",
    description: "Amazon matched Sony WH-1000XM5 at ₹29,990. Repricing rule triggered.",
    timestamp: "45m ago",
    isRead: false,
    link: "/intelligence",
  },
  {
    id: "notif-3",
    type: "drift",
    title: "Schema Canary Warning",
    description: "Croma adapter reported selector divergence. Circuit breaker state: HEALTHY.",
    timestamp: "2h ago",
    isRead: true,
    link: "/status",
  },
];

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-1)] border border-[var(--border-default)] hover:border-[var(--border-strong)] text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
        aria-label={`Open notifications (${unreadCount} unread)`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-accent)] text-[9px] font-bold text-black font-mono">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Slide-over Drawer / Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-[var(--radius-lg)] bg-[var(--surface-1)] border border-[var(--border-default)] shadow-[var(--elevation-3)] z-50 overflow-hidden font-mono">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-2)]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                <span className="text-xs font-bold text-[var(--text-1)] tracking-wider">
                  REALTIME DISPATCH ({unreadCount})
                </span>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs text-[var(--color-accent)] hover:underline focus-visible:outline-none"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-[var(--border-subtle)]">
              {notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link ?? "#"}
                  onClick={() => setIsOpen(false)}
                  className={`block p-4 transition-colors hover:bg-[var(--surface-2)] ${
                    n.isRead ? "opacity-75" : "bg-[var(--surface-2)]/50"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span
                      className={`font-semibold ${
                        n.type === "price_drop"
                          ? "text-[var(--color-success)]"
                          : n.type === "drift"
                          ? "text-[var(--color-warn)]"
                          : "text-[var(--color-info)]"
                      }`}
                    >
                      {n.type === "price_drop"
                        ? "▼ PRICE DROP"
                        : n.type === "drift"
                        ? "⚠ DRIFT ALERT"
                        : "⚡ REPRICING"}
                    </span>
                    <span className="text-[10px] text-[var(--text-3)]">{n.timestamp}</span>
                  </div>
                  <div className="text-xs text-[var(--text-1)] font-sans font-medium mb-1">
                    {n.title}
                  </div>
                  <div className="text-[11px] text-[var(--text-2)] font-sans">
                    {n.description}
                  </div>
                </Link>
              ))}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-[var(--surface-2)] border-t border-[var(--border-subtle)] text-center text-[10px] text-[var(--text-3)]">
              Realtime WebSocket stream connected · Channel: <span className="text-[var(--text-2)]">public:dispatches</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
