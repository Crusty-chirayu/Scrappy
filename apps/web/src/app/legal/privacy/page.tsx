import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[var(--radius-sm)] text-xs font-mono text-[var(--color-accent)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 mb-4">
        ● PRIVACY &amp; DATA GOVERNANCE
      </div>
      <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-[var(--text-1)] mb-4">
        Privacy Policy
      </h1>
      <p className="text-sm text-[var(--text-3)] mb-8 pb-6 border-b border-[var(--border)]">
        Effective Date: October 2026 • Compliant with GDPR &amp; Digital Personal Data Protection (DPDP) Act
      </p>

      <div className="space-y-6 text-sm text-[var(--text-2)] leading-relaxed">
        <section>
          <h2 className="text-lg font-display font-bold text-[var(--text-1)] mb-2">1. Overview &amp; Commitment</h2>
          <p>
            Scrappy is a product and price graph engine. We harvest catalogue metadata, not human identities. We believe in privacy by design, minimal data collection, and complete transparency regarding how account and operational data is handled.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-[var(--text-1)] mb-2">2. Information We Collect</h2>
          <div className="space-y-3">
            <div>
              <strong className="text-[var(--text-1)]">Account Information:</strong> When you register for Scrappy, we collect your email address, workspace name, and billing details necessary to provision services and process invoices.
            </div>
            <div>
              <strong className="text-[var(--text-1)]">Public E-Commerce Metadata:</strong> Our scraping engine collects publicly available product details (SKU, title, price, in-stock status, and store URL). We never collect customer checkout histories, buyer identities, or private forum discussions.
            </div>
            <div>
              <strong className="text-[var(--text-1)]">Usage &amp; Telemetry:</strong> Anonymized API request logs, response times, and error codes used to maintain platform stability and rate limiting.
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-[var(--text-1)] mb-2">3. Workspace Data Isolation (Row-Level Security)</h2>
          <p>
            Every user-defined watchlist, price alert, extract template, and custom scraper rule is cryptographically tagged with a <code className="text-[var(--color-accent)] font-mono">workspace_id</code>. Access is enforced at the database layer via PostgreSQL Row Level Security (RLS). Cross-tenant data leakage is architecturally impossible.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-[var(--text-1)] mb-2">4. Third-Party Integrations</h2>
          <p>
            We partner exclusively with trusted payment providers (Razorpay / Stripe) and transactional mail providers. Payment card details are tokenized directly with PCI-DSS compliant processors; Scrappy never touches or stores raw credit card numbers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-display font-bold text-[var(--text-1)] mb-2">5. Data Deletion &amp; Rights</h2>
          <p>
            You have the right to export your workspace data or delete your account at any time. When an account is deleted, all associated alerts, watchlists, and API keys are permanently purged within 30 days. For privacy inquiries, contact <span className="font-mono text-[var(--color-accent)]">privacy@scrappy.in</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
