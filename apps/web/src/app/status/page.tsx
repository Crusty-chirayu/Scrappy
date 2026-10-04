"use client";

import React, { useState } from "react";

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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#132A13] text-[#70E000] border border-[#2D6A4F]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#70E000] animate-pulse"></span>
            Operational
          </span>
        );
      case "STANDBY":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#1F242F] text-[#98A2B3] border border-[#344054]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#98A2B3]"></span>
            Standby / Offline
          </span>
        );
      case "DEGRADED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#361E14] text-[#F38A3E] border border-[#7A3614]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F38A3E]"></span>
            Degraded
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262E3C] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono text-[#C6F135] bg-[#121A0F] border border-[#253915] mb-2">
            ● SYSTEM MONITOR
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">System Status & Latency</h1>
          <p className="text-sm text-[#98A2B3] mt-1">
            Real-time operational health across scrapers, database instances, and API clusters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded bg-[#0F1217] border border-[#2D6A4F] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#70E000] animate-ping"></span>
            <span className="text-xs font-mono text-[#70E000] font-semibold">ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded bg-[#0F1217] border border-[#262E3C]">
          <div className="text-xs font-mono text-[#98A2B3]">OVERALL UPTIME (30D)</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">99.98%</div>
          <div className="text-xs text-[#70E000] mt-1">0 active incidents</div>
        </div>
        <div className="p-4 rounded bg-[#0F1217] border border-[#262E3C]">
          <div className="text-xs font-mono text-[#98A2B3]">SEARCH API P95 LATENCY</div>
          <div className="text-2xl font-bold font-mono text-[#C6F135] mt-1">78 ms</div>
          <div className="text-xs text-[#98A2B3] mt-1">Budget: &lt; 150 ms (Passing)</div>
        </div>
        <div className="p-4 rounded bg-[#0F1217] border border-[#262E3C]">
          <div className="text-xs font-mono text-[#98A2B3]">CIRCUIT BREAKERS</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">0 Tripped</div>
          <div className="text-xs text-[#70E000] mt-1">All 4 adapters healthy</div>
        </div>
      </div>

      {/* Services Table */}
      <div className="border border-[#262E3C] rounded overflow-hidden bg-[#0F1217] mb-12">
        <div className="px-5 py-3 border-b border-[#262E3C] bg-[#14181F] text-xs font-mono font-semibold text-[#98A2B3]">
          ACTIVE SUBSYSTEMS & ADAPTERS
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#262E3C] text-xs font-mono text-[#98A2B3]">
              <th className="px-5 py-3 font-medium">Service Name</th>
              <th className="px-5 py-3 font-medium">Domain</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Latency</th>
              <th className="px-5 py-3 font-medium text-right">30d Uptime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262E3C]">
            {services.map((svc) => (
              <tr key={svc.name} className="hover:bg-[#151922] transition-colors">
                <td className="px-5 py-3.5 font-medium text-white">{svc.name}</td>
                <td className="px-5 py-3.5 text-xs text-[#98A2B3] font-mono">{svc.category}</td>
                <td className="px-5 py-3.5">{getStatusBadge(svc.status)}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-[#98A2B3]">{svc.latency}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-right text-white">{svc.uptime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Past Incidents */}
      <div className="border border-[#262E3C] rounded p-6 bg-[#0F1217]">
        <h2 className="text-base font-bold text-white mb-2">Past Incidents & Maintenance (Last 30 Days)</h2>
        <p className="text-xs text-[#98A2B3] mb-4">
          All incidents are published transparently following post-mortem reviews.
        </p>
        <div className="space-y-4">
          <div className="border-l-2 border-[#2D6A4F] pl-4 py-1">
            <div className="text-xs font-mono text-[#98A2B3]">September 28, 2026 — 03:15 UTC</div>
            <div className="text-sm font-semibold text-white mt-0.5">Flipkart DOM Selector Schema Drift Resolved</div>
            <div className="text-xs text-[#98A2B3] mt-1">
              Automated drift detector identified selector mismatch on `.hlCwKc` wrapper. Fallback selector chain activated automatically with zero customer downtime.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
