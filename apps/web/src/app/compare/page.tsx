export default function ComparePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Compare Products & Prices</h1>
          <p className="text-sm text-[#98A2B3]">
            Verified price history and deal scoring across merchants.
          </p>
        </div>
        <div className="text-xs font-mono text-[#C6F135] bg-[#141922] px-3 py-1.5 rounded border border-[#262E3C]">
          STATUS: READY
        </div>
      </div>

      <div className="p-4 rounded border border-[#262E3C] bg-[#0F1217] mb-8">
        <input
          type="text"
          placeholder="Search products, brands, models, or paste a URL..."
          className="w-full bg-[#141922] border border-[#262E3C] rounded px-4 py-3 text-sm text-white placeholder-[#5B677C] focus:outline-none focus:border-[#C6F135]"
        />
      </div>

      <div className="border border-dashed border-[#262E3C] rounded-lg p-12 text-center text-sm text-[#5B677C]">
        Search for a product or paste an Amazon/Flipkart URL above to view historical price charts
        and verified offers.
      </div>
    </div>
  );
}
