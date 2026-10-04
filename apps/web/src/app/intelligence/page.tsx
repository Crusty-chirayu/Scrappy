export default function IntelligencePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Market Intelligence</h1>
          <p className="text-sm text-[#98A2B3]">
            Competitor price tracking, gap analysis, and repricing rules.
          </p>
        </div>
        <div className="text-xs font-mono text-[#5AA9FF] bg-[#141922] px-3 py-1.5 rounded border border-[#262E3C]">
          TIER: ENTERPRISE READY
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 rounded border border-[#262E3C] bg-[#0F1217]">
          <div className="text-xs text-[#98A2B3] mb-1 font-mono">TRACKED PRODUCTS</div>
          <div className="text-2xl font-mono font-bold text-white">0</div>
        </div>
        <div className="p-4 rounded border border-[#262E3C] bg-[#0F1217]">
          <div className="text-xs text-[#98A2B3] mb-1 font-mono">ACTIVE COMPETITORS</div>
          <div className="text-2xl font-mono font-bold text-white">0</div>
        </div>
        <div className="p-4 rounded border border-[#262E3C] bg-[#0F1217]">
          <div className="text-xs text-[#98A2B3] mb-1 font-mono">PRICE ANOMALIES (24H)</div>
          <div className="text-2xl font-mono font-bold text-white">0</div>
        </div>
      </div>

      <div className="border border-dashed border-[#262E3C] rounded-lg p-12 text-center text-sm text-[#5B677C]">
        No tracked products in workspace. Connect your catalog or add competitor URLs to begin
        monitoring.
      </div>
    </div>
  );
}
