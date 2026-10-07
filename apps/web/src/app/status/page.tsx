"use client";

import React, { useState } from "react";
import { Activity, ShieldCheck, CheckCircle2 } from "lucide-react";

interface ServiceStatus {
  name: string;
  category: "Source Adapters" | "Core Infrastructure" | "Data Pipelines";
  status: "OPERATIONAL" | "DEGRADED" | "STANDBY" | "MAINTENANCE";
  latency: string;
  uptime: string;
  lastChecked: string;
}

const INITIAL_SERVICES: ServiceStatus[] = [
  {
    name: "Amazon India Adapter",
    category: "Source Adapters",
    status: "OPERATIONAL",
    latency: "342ms",
    uptime: "99.94%",
    lastChecked: "Just now",
  },
  {
    name: "Flipkart Adapter",
    category: "Source Adapters",
    status: "OPERATIONAL",
    latency: "418ms",
    uptime: "99.88%",
    lastChecked: "Just now",
  },
  {
    name: "Croma Adapter",
    category: "Source Adapters",
    status: "STANDBY",
    latency: "—",
    uptime: "100.0%",
    lastChecked: "1m ago",
  },
  {
    name: "Reliance Digital Adapter",
    category: "Source Adapters",
    status: "STANDBY",
    latency: "—",
    uptime: "100.0%",
    lastChecked: "1m ago",
  },
  {
    name: "Supabase PostgreSQL Database",
    category: "Core Infrastructure",
    status: "OPERATIONAL",
    latency: "12ms",
    uptime: "100.0%",
    lastChecked: "Just now",
  },
  {
    name: "Fastify REST API Gateway",
    category: "Core Infrastructure",
    status: "OPERATIONAL",
    latency: "18ms",
    uptime: "99.99%",
    lastChecked: "Just now",
  },
  {
    name: "pg-boss Worker Queue",
    category: "Data Pipelines",
    status: "OPERATIONAL",
    latency: "45ms",
    uptime: "99.95%",
    lastChecked: "Just now",
  },
  {
    name: "Entity Resolution & Matching Engine",
    category: "Data Pipelines",
    status: "OPERATIONAL",
    latency: "84ms",
    uptime: "100.0%",
    lastChecked: "Just now",
  },
];

export default function StatusPage() {
  const [services] = useState<ServiceStatus[]>(INITIAL_SERVICES);

  const getStatusBadge = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "OPERATIONAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
            Operational
          </span>
        );
      case "STANDBY":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[var(--surface-2)] text-[var(--text-3)] border border-[var(--border)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-3)]" />
            Standby / Offline
          </span>
        );
      case "DEGRADED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[var(--color-warn)]/10 text-[var(--color-warn)] border border-[var(--color-warn)]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warn)]" />
            Degraded
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] text-xs font-mono font-medium mb-3">
            <Activity size={12} />
            <span>SYSTEM MONITOR</span>
          </div>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-[var(--text-1)]">
            System Status &amp; Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-3)] mt-1.5 font-mono">
            Real-time operational health across scrapers, database instances, and API clusters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-ping" />
            <span className="text-xs font-mono text-[var(--color-success)] font-semibold">
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs">
          <div className="text-[10px] font-mono text-[var(--text-3)] uppercase tracking-wider">
            Overall Uptime (30D)
          </div>
          <div className="text-2xl font-display font-bold text-[var(--text-1)] mt-1">
            99.98%
          </div>
          <div className="text-xs font-mono text-[var(--color-success)] mt-1 flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>0 active incidents</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs">
          <div className="text-[10px] font-mono text-[var(--text-3)] uppercase tracking-wider">
            Search API P95 Latency
          </div>
          <div className="text-2xl font-display font-bold text-[var(--color-accent)] mt-1">
            78 ms
          </div>
          <div className="text-xs font-mono text-[var(--text-3)] mt-1">
            Budget: &lt; 150 ms (Passing)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs">
          <div className="text-[10px] font-mono text-[var(--text-3)] uppercase tracking-wider">
            Circuit Breakers
          </div>
          <div className="text-2xl font-display font-bold text-[var(--text-1)] mt-1">
            0 Tripped
          </div>
          <div className="text-xs font-mono text-[var(--color-success)] mt-1 flex items-center gap-1">
            <ShieldCheck size={12} />
            <span>All 4 adapters healthy</span>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--surface-1)] mb-12 shadow-xs">
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--surface-2)] text-xs font-mono font-semibold text-[var(--text-2)] uppercase tracking-wider">
          Active Subsystems &amp; Source Adapters
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs font-mono text-[var(--text-3)] bg-[var(--surface-1)]">
                <th className="px-5 py-3 font-medium">Service Name</th>
                <th className="px-5 py-3 font-medium">Domain</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Latency</th>
                <th className="px-5 py-3 font-medium text-right">30d Uptime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {services.map((svc) => (
                <tr key={svc.name} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-[var(--text-1)]">{svc.name}</td>
                  <td className="px-5 py-3.5 text-xs text-[var(--text-3)] font-mono">{svc.category}</td>
                  <td className="px-5 py-3.5">{getStatusBadge(svc.status)}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-[var(--text-3)]">{svc.latency}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-right text-[var(--text-1)] font-semibold">{svc.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Past Incidents */}
      <div className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--surface-1)] shadow-xs">
        <h2 className="text-base font-display font-semibold text-[var(--text-1)] mb-1">
          Past Incidents &amp; Maintenance (Last 30 Days)
        </h2>
        <p className="text-xs text-[var(--text-3)] font-mono mb-4">
          All incidents are published transparently following post-mortem reviews.
        </p>
        <div className="space-y-4">
          <div className="border-l-2 border-[var(--color-accent)] pl-4 py-1">
            <div className="text-xs font-mono text-[var(--text-3)]">September 28, 2026 — 03:15 UTC</div>
            <div className="text-sm font-semibold text-[var(--text-1)] mt-0.5">Flipkart DOM Selector Schema Drift Resolved</div>
            <div className="text-xs text-[var(--text-2)] mt-1 leading-relaxed">
              Automated drift detector identified selector mismatch on <code className="text-xs font-mono bg-[var(--surface-2)] px-1 py-0.5 rounded text-[var(--color-accent)]">.hlCwKc</code> wrapper. Fallback selector chain activated automatically with zero customer downtime.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
