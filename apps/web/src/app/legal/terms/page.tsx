import React from "react";

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[var(--radius-sm)] text-xs font-mono text-[var(--color-accent)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 mb-4">
        ● LEGAL FRAMEWORK
      </div>
      <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-[var(--text-1)] mb-4">
        Terms of Service
      </h1>
      <p className="text-sm text-[var(--text-3)] mb-8 pb-6 border-b border-[var(--border)]">
        Effective Date: October 2026 • Document Ref: TOS-2026-V1
      </p>

      <div className="space-y-6 text-sm text-[var(--text-2)] leading-relaxed">
        <section>
          <h2 className="text-lg font-display font-bold text-[var(--text-1)] mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Scrappy platform (including Compare, Intelligence, Extract, and the Public REST API), you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of an enterprise or organization, you represent that you have the authority to bind that entity.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-[var(--text-1)] mb-2">2. Description of Platform</h2>
          <p>
            Scrappy is a precision data platform providing historical price comparisons, market intelligence, and resilient web extraction tools. All prices, availability data, and deal scores represent point-in-time extraction and should be verified on the seller&apos;s checkout page prior to purchase.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-[var(--text-1)] mb-2">3. Acceptable Use &amp; API Rate Limits</h2>
          <p>
            Users agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--text-3)]">
            <li>Target internal or private network addresses (SSRF) using the Extract Engine.</li>
            <li>Attempt to reverse-engineer API authentication tokens or exceed documented plan tier quotas.</li>
            <li>Resell raw, un-transformed price feeds without a valid Enterprise License agreement.</li>
            <li>Circumvent or tamper with tenant isolation or workspace access controls.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-[var(--text-1)] mb-2">4. Service Level &amp; Data Provenance</h2>
          <p>
            Every product metric is accompanied by provenance metadata (origin store, extraction timestamp, and confidence score). While Scrappy strives for 99.9% uptime and zero match false positives, we provide data &quot;as-is&quot; without warranties against retailer price changes that occur post-crawl.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-[var(--text-1)] mb-2">5. Subscriptions, Payments &amp; Cancellation</h2>
          <p>
            Subscriptions are billed monthly in advance via Razorpay / Stripe. You may cancel your subscription at any time via the workspace billing portal. Cancellations take effect at the conclusion of the active billing period.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-[var(--text-1)] mb-2">6. Governing Law</h2>
          <p>
            These terms are governed by the laws of India, with exclusive jurisdiction in the courts of Bangalore / Mumbai.
          </p>
        </section>
      </div>
    </div>
  );
}
