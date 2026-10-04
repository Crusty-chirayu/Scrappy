export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Developer Documentation</h1>
          <p className="text-sm text-[#98A2B3]">
            API reference, webhooks, rate limits, and SDK integration guides.
          </p>
        </div>
        <div className="text-xs font-mono text-[#2FBF8A] bg-[#141922] px-3 py-1.5 rounded border border-[#262E3C]">
          SPEC: OPENAPI 3.1
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded border border-[#262E3C] bg-[#0F1217]">
          <h2 className="text-base font-bold text-white mb-1">REST API Endpoints</h2>
          <p className="text-sm text-[#98A2B3] mb-3">
            Interactive OpenAPI 3.1 documentation is served directly from the API service.
          </p>
          <code className="text-xs font-mono text-[#C6F135] bg-[#141922] px-2 py-1 rounded">
            GET /docs (Swagger UI)
          </code>
        </div>
        <div className="p-4 rounded border border-[#262E3C] bg-[#0F1217]">
          <h2 className="text-base font-bold text-white mb-1">Data Provenance Guarantee</h2>
          <p className="text-sm text-[#98A2B3]">
            Every data observation includes source domain, capture timestamp, extraction
            methodology, and confidence scoring.
          </p>
        </div>
      </div>
    </div>
  );
}
