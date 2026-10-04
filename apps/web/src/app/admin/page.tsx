"use client";

import React, { useState } from "react";

interface SourceHealth {
  id: string;
  name: string;
  domain: string;
  circuitState: "CLOSED" | "OPEN" | "HALF_OPEN";
  failureCount: number;
  successRate: number;
  lastScraped: string;
  avgLatencyMs: number;
  activeWorkers: number;
}

interface MatchCandidate {
  id: string;
  primaryTitle: string;
  primaryStore: string;
  primaryPrice: number;
  candidateTitle: string;
  candidateStore: string;
  candidatePrice: number;
  confidence: number;
  differenceReasons: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
}

const INITIAL_SOURCES: SourceHealth[] = [
  {
    id: "amazon_in",
    name: "Amazon India",
    domain: "amazon.in",
    circuitState: "CLOSED",
    failureCount: 0,
    successRate: 99.8,
    lastScraped: "1m ago",
    avgLatencyMs: 342,
    activeWorkers: 4,
  },
  {
    id: "flipkart",
    name: "Flipkart",
    domain: "flipkart.com",
    circuitState: "CLOSED",
    failureCount: 1,
    successRate: 99.2,
    lastScraped: "3m ago",
    avgLatencyMs: 418,
    activeWorkers: 3,
  },
  {
    id: "croma",
    name: "Croma",
    domain: "croma.com",
    circuitState: "CLOSED",
    failureCount: 0,
    successRate: 100.0,
    lastScraped: "15m ago",
    avgLatencyMs: 290,
    activeWorkers: 1,
  },
  {
    id: "reliance_digital",
    name: "Reliance Digital",
    domain: "reliancedigital.in",
    circuitState: "CLOSED",
    failureCount: 0,
    successRate: 100.0,
    lastScraped: "18m ago",
    avgLatencyMs: 310,
    activeWorkers: 1,
  },
];

const INITIAL_MATCH_QUEUE: MatchCandidate[] = [
  {
    id: "rev-101",
    primaryTitle: "Apple iPhone 15 (128 GB) - Blue",
    primaryStore: "Amazon India",
    primaryPrice: 65999,
    candidateTitle: "APPLE iPhone 15 (Blue, 128 GB)",
    candidateStore: "Flipkart",
    candidatePrice: 65499,
    confidence: 0.88,
    differenceReasons: ["Title token permutation", "Color case difference: 'Blue' vs 'blue'"],
    status: "PENDING",
  },
  {
    id: "rev-102",
    primaryTitle: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    primaryStore: "Amazon India",
    primaryPrice: 29990,
    candidateTitle: "Sony WH-1000XM4 Wireless Active Noise Cancelling",
    candidateStore: "Flipkart",
    candidatePrice: 22990,
    confidence: 0.74,
    differenceReasons: ["Model series mismatch: 'XM5' vs 'XM4'", "Price difference > 20%"],
    status: "PENDING",
  },
  {
    id: "rev-103",
    primaryTitle: "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256 GB)",
    primaryStore: "Amazon India",
    primaryPrice: 129999,
    candidateTitle: "SAMSUNG Galaxy S24 Ultra 5G (Titanium Gray, 512 GB)",
    candidateStore: "Croma",
    candidatePrice: 139999,
    confidence: 0.82,
    differenceReasons: ["Storage capacity variant mismatch: '256 GB' vs '512 GB'"],
    status: "PENDING",
  },
];

export default function AdminPage() {
  const [sources, setSources] = useState<SourceHealth[]>(INITIAL_SOURCES);
  const [queue, setQueue] = useState<MatchCandidate[]>(INITIAL_MATCH_QUEUE);
  const [activeTab, setActiveTab] = useState<"sources" | "matching" | "workers">("sources");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleTripCircuit = (sourceId: string) => {
    setSources((prev) =>
      prev.map((s) =>
        s.id === sourceId
          ? { ...s, circuitState: "OPEN" as const, failureCount: 5 }
          : s
      )
    );
    setStatusMessage(`Circuit breaker manually TRIPPED for ${sourceId}`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleResetCircuit = (sourceId: string) => {
    setSources((prev) =>
      prev.map((s) =>
        s.id === sourceId
          ? { ...s, circuitState: "CLOSED" as const, failureCount: 0 }
          : s
      )
    );
    setStatusMessage(`Circuit breaker manually RESET for ${sourceId}`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleApproveMatch = (id: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "APPROVED" as const } : item))
    );
    setStatusMessage(`Match candidate ${id} APPROVED and added to entity graph.`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleRejectMatch = (id: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "REJECTED" as const } : item))
    );
    setStatusMessage(`Match candidate ${id} REJECTED. Entity merge avoided.`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-[#262E3C] gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono text-[#F38A3E] bg-[#2E190E] border border-[#522915] mb-2">
            ● INTERNAL OPERATIONS CONSOLE
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Scrappy Admin & Health Hub</h1>
          <p className="text-sm text-[#98A2B3] mt-1">
            Real-time circuit breakers, source adapter telemetry, and human-in-the-loop entity match review.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded text-xs font-mono bg-[#14181F] border border-[#262E3C] text-[#98A2B3]">
            Operator: <span className="text-white font-medium">admin@scrappy.in</span>
          </span>
          <span className="px-3 py-1.5 rounded text-xs font-mono bg-[#121A0F] border border-[#253915] text-[#C6F135]">
            AUTH: VALID
          </span>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-6 p-4 rounded bg-[#162215] border border-[#2D6A4F] text-[#C6F135] text-xs font-mono flex items-center justify-between animate-fade-in">
          <span>✓ {statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-[#98A2B3] hover:text-white">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262E3C] mb-8 pb-px">
        <button
          onClick={() => setActiveTab("sources")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
            activeTab === "sources"
              ? "border-[#C6F135] text-white"
              : "border-transparent text-[#98A2B3] hover:text-white"
          }`}
        >
          Sources & Circuit Breakers ({sources.length})
        </button>
        <button
          onClick={() => setActiveTab("matching")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
            activeTab === "matching"
              ? "border-[#C6F135] text-white"
              : "border-transparent text-[#98A2B3] hover:text-white"
          }`}
        >
          Match Review Queue ({queue.filter((q) => q.status === "PENDING").length} pending)
        </button>
        <button
          onClick={() => setActiveTab("workers")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
            activeTab === "workers"
              ? "border-[#C6F135] text-white"
              : "border-transparent text-[#98A2B3] hover:text-white"
          }`}
        >
          pg-boss Queue & Storage
        </button>
      </div>

      {/* TAB 1: Sources */}
      {activeTab === "sources" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded bg-[#0F1217] border border-[#262E3C]">
              <div className="text-xs font-mono text-[#98A2B3]">TOTAL SOURCES</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">4</div>
              <div className="text-xs text-[#70E000] mt-1">4 connected</div>
            </div>
            <div className="p-4 rounded bg-[#0F1217] border border-[#262E3C]">
              <div className="text-xs font-mono text-[#98A2B3]">ACTIVE BREAKERS</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {sources.filter((s) => s.circuitState === "CLOSED").length} / {sources.length}
              </div>
              <div className="text-xs text-[#70E000] mt-1">Normal operation</div>
            </div>
            <div className="p-4 rounded bg-[#0F1217] border border-[#262E3C]">
              <div className="text-xs font-mono text-[#98A2B3]">AVG LATENCY</div>
              <div className="text-2xl font-bold font-mono text-[#C6F135] mt-1">340 ms</div>
              <div className="text-xs text-[#98A2B3] mt-1">p95 &lt; 500ms target</div>
            </div>
            <div className="p-4 rounded bg-[#0F1217] border border-[#262E3C]">
              <div className="text-xs font-mono text-[#98A2B3]">FAILURES (24H)</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">1</div>
              <div className="text-xs text-[#70E000] mt-1">99.9% availability</div>
            </div>
          </div>

          <div className="border border-[#262E3C] rounded overflow-hidden bg-[#0F1217]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#14181F] border-b border-[#262E3C] text-xs font-mono text-[#98A2B3]">
                <tr>
                  <th className="px-5 py-3">Source Name</th>
                  <th className="px-5 py-3">Domain</th>
                  <th className="px-5 py-3">Circuit State</th>
                  <th className="px-5 py-3">Success Rate</th>
                  <th className="px-5 py-3">Avg Latency</th>
                  <th className="px-5 py-3">Last Scraped</th>
                  <th className="px-5 py-3 text-right">Circuit Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262E3C]">
                {sources.map((src) => (
                  <tr key={src.id} className="hover:bg-[#151922] transition-colors">
                    <td className="px-5 py-4 font-medium text-white">{src.name}</td>
                    <td className="px-5 py-4 font-mono text-xs text-[#98A2B3]">{src.domain}</td>
                    <td className="px-5 py-4">
                      {src.circuitState === "CLOSED" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#132A13] text-[#70E000] border border-[#2D6A4F]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#70E000]"></span>
                          CLOSED (Normal)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#351414] text-[#FF5A5A] border border-[#6B2424]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A5A]"></span>
                          OPEN (Tripped)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-white">{src.successRate}%</td>
                    <td className="px-5 py-4 font-mono text-xs text-[#98A2B3]">{src.avgLatencyMs} ms</td>
                    <td className="px-5 py-4 text-xs text-[#98A2B3]">{src.lastScraped}</td>
                    <td className="px-5 py-4 text-right">
                      {src.circuitState === "CLOSED" ? (
                        <button
                          onClick={() => handleTripCircuit(src.id)}
                          className="px-2.5 py-1 text-xs font-mono rounded bg-[#2D1616] text-[#FF7878] hover:bg-[#4A1E1E] border border-[#6B2424] transition-colors"
                        >
                          Force Trip
                        </button>
                      ) : (
                        <button
                          onClick={() => handleResetCircuit(src.id)}
                          className="px-2.5 py-1 text-xs font-mono rounded bg-[#172B17] text-[#70E000] hover:bg-[#203D20] border border-[#2D6A4F] transition-colors"
                        >
                          Force Reset
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Match Review Queue */}
      {activeTab === "matching" && (
        <div className="space-y-6">
          <div className="p-4 rounded bg-[#0F1217] border border-[#262E3C] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Uncertain Match Resolution Queue</h2>
              <p className="text-xs text-[#98A2B3] mt-0.5">
                Constitution Rule 4: &quot;A false product match is worse than a missed match. Uncertain matches must be verified by humans.&quot;
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded bg-[#1F242F] text-[#5AA9FF] border border-[#344054]">
              Threshold: 0.70 &lt;= Score &lt; 0.90
            </span>
          </div>

          <div className="space-y-4">
            {queue.map((candidate) => (
              <div
                key={candidate.id}
                className={`p-5 rounded border ${
                  candidate.status === "APPROVED"
                    ? "border-[#2D6A4F] bg-[#0E1710]"
                    : candidate.status === "REJECTED"
                    ? "border-[#5E2424] bg-[#170E0E]"
                    : "border-[#262E3C] bg-[#0F1217]"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#262E3C] mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1B212C] text-[#C6F135]">
                      {candidate.id}
                    </span>
                    <span className="text-xs font-mono text-[#98A2B3]">
                      Similarity Score: <span className="text-white font-bold">{(candidate.confidence * 100).toFixed(0)}%</span>
                    </span>
                  </div>
                  <div>
                    {candidate.status === "PENDING" ? (
                      <span className="text-xs font-mono text-[#F38A3E] bg-[#2E190E] px-2 py-0.5 rounded border border-[#522915]">
                        Awaiting Human Decision
                      </span>
                    ) : (
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded ${
                          candidate.status === "APPROVED"
                            ? "text-[#70E000] bg-[#121A0F] border border-[#253915]"
                            : "text-[#FF5A5A] bg-[#2A1212] border border-[#4E1E1E]"
                        }`}
                      >
                        {candidate.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded bg-[#14181F] border border-[#262E3C]">
                    <div className="text-xs font-mono text-[#98A2B3] mb-1">ORIGINAL PRODUCT ({candidate.primaryStore})</div>
                    <div className="text-sm font-semibold text-white">{candidate.primaryTitle}</div>
                    <div className="text-base font-mono font-bold text-[#C6F135] mt-2">
                      ₹{candidate.primaryPrice.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="p-3 rounded bg-[#14181F] border border-[#262E3C]">
                    <div className="text-xs font-mono text-[#98A2B3] mb-1">CANDIDATE OFFER ({candidate.candidateStore})</div>
                    <div className="text-sm font-semibold text-white">{candidate.candidateTitle}</div>
                    <div className="text-base font-mono font-bold text-[#C6F135] mt-2">
                      ₹{candidate.candidatePrice.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                {/* Diff Explanations */}
                <div className="mb-4">
                  <div className="text-xs font-mono text-[#98A2B3] mb-1.5">Algorithmic Ambiguities Detected:</div>
                  <ul className="list-disc pl-5 text-xs text-[#F38A3E] space-y-1">
                    {candidate.differenceReasons.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                {candidate.status === "PENDING" && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleApproveMatch(candidate.id)}
                      className="px-4 py-2 rounded text-xs font-mono font-semibold bg-[#132A13] text-[#70E000] hover:bg-[#1E431E] border border-[#2D6A4F] transition-colors"
                    >
                      ✓ Approve As Same Product
                    </button>
                    <button
                      onClick={() => handleRejectMatch(candidate.id)}
                      className="px-4 py-2 rounded text-xs font-mono font-semibold bg-[#2B1414] text-[#FF5A5A] hover:bg-[#431F1F] border border-[#6B2424] transition-colors"
                    >
                      ✕ Reject & Keep Separate
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Workers & Queue */}
      {activeTab === "workers" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded bg-[#0F1217] border border-[#262E3C]">
              <div className="text-xs font-mono text-[#98A2B3]">ACTIVE WORKERS</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">4 Node Processes</div>
              <div className="text-xs text-[#70E000] mt-1">Session Mode (port 5432)</div>
            </div>
            <div className="p-4 rounded bg-[#0F1217] border border-[#262E3C]">
              <div className="text-xs font-mono text-[#98A2B3]">PENDING JOBS IN QUEUE</div>
              <div className="text-2xl font-bold font-mono text-[#C6F135] mt-1">0</div>
              <div className="text-xs text-[#98A2B3] mt-1">No backpressure</div>
            </div>
            <div className="p-4 rounded bg-[#0F1217] border border-[#262E3C]">
              <div className="text-xs font-mono text-[#98A2B3]">TOTAL JOBS COMPLETED</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">12,480</div>
              <div className="text-xs text-[#70E000] mt-1">99.98% success rate</div>
            </div>
          </div>

          <div className="border border-[#262E3C] rounded p-6 bg-[#0F1217]">
            <h3 className="text-sm font-bold text-white mb-2">PostgreSQL Database Connection Mode</h3>
            <p className="text-xs text-[#98A2B3] leading-relaxed mb-4">
              Scrappy workers connect to Supabase PostgreSQL using direct session connections (port 5432) rather than the transaction pooler (port 6543) as required by pg-boss listeners and advisory locks.
            </p>
            <div className="p-3 rounded bg-[#0A0C0F] border border-[#262E3C] font-mono text-xs text-[#C6F135]">
              DATABASE_URL=postgresql://postgres.xxx:5432/postgres?sslmode=require
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
