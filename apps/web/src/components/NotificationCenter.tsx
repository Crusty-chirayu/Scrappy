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
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded bg-[#141922] border border-[#262E3C] hover:border-[#5B677C] text-[#98A2B3] hover:text-white transition-colors"
        aria-label={`Open notifications (${unreadCount} unread)`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C6F135] text-[9px] font-bold text-[#0A0C0F] font-mono">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Slide-over Drawer / Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-[#0F1217] border border-[#262E3C] shadow-2xl z-50 overflow-hidden font-mono">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#262E3C] bg-[#141922]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C6F135]" />
                <span className="text-xs font-bold text-white tracking-wider">
                  REALTIME DISPATCH ({unreadCount})
                </span>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-[#C6F135] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-[#262E3C]">
              {notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link ?? "#"}
                  onClick={() => setIsOpen(false)}
                  className={`block p-3.5 transition-colors hover:bg-[#141922] ${
                    n.isRead ? "opacity-75" : "bg-[#141822]/60"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span
                      className={`font-semibold ${
                        n.type === "price_drop"
                          ? "text-[#2FBF8A]"
                          : n.type === "drift"
                          ? "text-[#FFB020]"
                          : "text-[#5AA9FF]"
                      }`}
                    >
                      {n.type === "price_drop"
                        ? "▼ PRICE DROP"
                        : n.type === "drift"
                        ? "⚠ DRIFT ALERT"
                        : "⚡ REPRICING"}
                    </span>
                    <span className="text-[10px] text-[#5B677C]">{n.timestamp}</span>
                  </div>
                  <div className="text-xs text-[#D6DBE3] font-sans font-medium mb-1">
                    {n.title}
                  </div>
                  <div className="text-[11px] text-[#98A2B3] font-sans">
                    {n.description}
                  </div>
                </Link>
              ))}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-[#0A0C0F] border-t border-[#262E3C] text-center text-[10px] text-[#5B677C]">
              Realtime WebSocket stream connected · Supabase Channel: <span className="text-[#98A2B3]">public:dispatches</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
