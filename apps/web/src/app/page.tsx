export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#262E3C] text-xs font-mono text-[#C6F135] mb-6">
        <span>●</span> PRECISION DATA INSTRUMENT
      </div>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
        The trusted, historical graph of products, merchants, and prices.
      </h1>
      <p className="text-lg text-[#98A2B3] max-w-2xl mb-12">
        Scrappy turns the messy web into structured truth. Three views on one unified platform:
        honest price comparison for shoppers, competitive intelligence for brands, and reliable web
        extraction for developers.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/compare"
          className="p-6 rounded border border-[#262E3C] hover:border-[#5B677C] transition-all bg-[#0F1217]"
        >
          <div className="text-xs font-mono text-[#C6F135] mb-2">FOR CONSUMERS</div>
          <h2 className="text-xl font-bold text-white mb-2">Compare</h2>
          <p className="text-sm text-[#98A2B3]">
            Track verified prices across Amazon, Flipkart, and leading stores with full provenance
            and deal scores.
          </p>
        </a>

        <a
          href="/intelligence"
          className="p-6 rounded border border-[#262E3C] hover:border-[#5B677C] transition-all bg-[#0F1217]"
        >
          <div className="text-xs font-mono text-[#5AA9FF] mb-2">FOR BUSINESSES</div>
          <h2 className="text-xl font-bold text-white mb-2">Intelligence</h2>
          <p className="text-sm text-[#98A2B3]">
            Monitor competitor catalogs, identify price gaps, and receive real-time repricing
            signals.
          </p>
        </a>

        <a
          href="/extract"
          className="p-6 rounded border border-[#262E3C] hover:border-[#5B677C] transition-all bg-[#0F1217]"
        >
          <div className="text-xs font-mono text-[#9A7BFF] mb-2">FOR DEVELOPERS</div>
          <h2 className="text-xl font-bold text-white mb-2">Extract</h2>
          <p className="text-sm text-[#98A2B3]">
            Schema-driven web extraction with automatic pagination, webhook callbacks, and OpenAPI
            endpoints.
          </p>
        </a>
      </div>
    </div>
  );
}
