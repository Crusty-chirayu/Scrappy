import React from "react";

export default function ResponsibleScrapingCharter() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[var(--radius-sm)] text-xs font-mono text-[var(--color-accent)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 mb-4">
        ● ETHICAL INFRASTRUCTURE CHARTER
      </div>
      <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-[var(--text-1)] mb-4">
        Responsible Scraping Charter &amp; Bot Policy
      </h1>
      <p className="text-sm text-[var(--text-3)] mb-8 pb-6 border-b border-[var(--border)]">
        Last updated: October 2026 • Document Ref: RFC-SCRAPPY-CHARTER-01
      </p>

      <div className="space-y-8 text-sm text-[var(--text-2)] leading-relaxed">
        <section>
          <h2 className="text-lg font-display font-bold text-[var(--text-1)] mb-3">1. Foundational Commitment</h2>
          <p>
            Scrappy is built on the strict premise that public e-commerce data should be accessible,
            verifiable, and respectful of host server stability. Our extraction architecture operates
            under uncompromising ethical engineering standards designed to protect retailers and host
            systems from unnecessary load, degradation, or disruption.
          </p>
        </section>

        <section className="bg-[var(--surface-1)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
          <h2 className="text-lg font-display font-bold text-[var(--text-1)] mb-4">2. The Five Pillars of Responsible Scraping</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="font-mono text-[var(--color-accent)] font-bold">01.</span>
              <div>
                <strong className="text-[var(--text-1)]">Strict Respect for robots.txt:</strong> Our crawler parser evaluates host robots.txt directives before any request is dispatched. Paths excluded by retailers are strictly omitted from crawling schedules.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-[var(--color-accent)] font-bold">02.</span>
              <div>
                <strong className="text-[var(--text-1)]">Per-Host Token Bucket Rate Limiting:</strong> We enforce strict domain concurrency limits (default: 2 req/sec on retail domains). Burst requests are queued and throttled automatically.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-[var(--color-accent)] font-bold">03.</span>
              <div>
                <strong className="text-[var(--text-1)]">Transparent Bot Identification:</strong> Every HTTP request issued by Scrappy identifies itself clearly via the User-Agent header:
                <code className="block mt-1 p-2 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--border)] font-mono text-xs text-[var(--color-accent)]">
                  User-Agent: ScrappyBot/1.0 (+https://scrappy.in/bot; bot@scrappy.in)
                </code>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-[var(--color-accent)] font-bold">04.</span>
              <div>
                <strong className="text-[var(--text-1)]">Zero CAPTCHA Bypass or Auth Circumvention:</strong> Scrappy does NOT solve CAPTCHAs, does not bypass authentication barriers, and does not harvest login-walled data. When a page triggers an access gate, our circuit breaker opens and transitions the adapter to an honest &quot;Source Unavailable&quot; state.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-[var(--color-accent)] font-bold">05.</span>
              <div>
                <strong className="text-[var(--text-1)]">No Personal or PII Harvesting:</strong> Scrappy exclusively extracts public catalogue metadata (titles, model numbers, pricing, availability, and merchant identities). User reviews with personal identifiers, customer profiles, and personal data are strictly filtered out.
              </div>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-[var(--text-1)] mb-3">3. Affiliate and Official API Preference</h2>
          <p>
            Whenever a retail partner provides an official API, product feed, or affiliate catalog (such as Amazon Product Advertising API or affiliate feeds), Scrappy configures that provider as the primary data pipeline and bypasses direct HTML extraction entirely.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-[var(--text-1)] mb-3">4. Host Contact &amp; Opt-Out</h2>
          <p>
            Site administrators wishing to adjust crawl frequencies, request IP allowlists/blocklists, or inquire about bot behavior can reach our operational engineering team 24/7 at <span className="font-mono text-[var(--color-accent)]">security@scrappy.in</span>. Requests are processed within 1 business day.
          </p>
        </section>
      </div>
    </div>
  );
}
