export default function ExtractPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Web Extract Studio</h1>
          <p className="text-sm text-[#98A2B3]">
            Define schemas, execute extraction runs, and export structured data.
          </p>
        </div>
        <div className="text-xs font-mono text-[#9A7BFF] bg-[#141922] px-3 py-1.5 rounded border border-[#262E3C]">
          ENGINE: CRAWLEE / PLAYWRIGHT
        </div>
      </div>

      <div className="p-6 rounded border border-[#262E3C] bg-[#0F1217] mb-8">
        <label className="block text-xs font-mono text-[#98A2B3] mb-2">TARGET URL</label>
        <input
          type="url"
          placeholder="https://example.com/products/item-123"
          className="w-full bg-[#141922] border border-[#262E3C] rounded px-4 py-2.5 text-sm text-white placeholder-[#5B677C] focus:outline-none focus:border-[#9A7BFF] mb-4"
        />
        <button className="px-4 py-2 rounded bg-[#C6F135] text-[#0A0C0F] font-bold text-sm hover:opacity-90 transition-opacity">
          Test Extraction
        </button>
      </div>

      <div className="border border-dashed border-[#262E3C] rounded-lg p-12 text-center text-sm text-[#5B677C]">
        No extraction tasks queued. Configure target schema or use the REST API to trigger batch
        extraction.
      </div>
    </div>
  );
}
