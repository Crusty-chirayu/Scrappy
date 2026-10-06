import { notFound } from "next/navigation";

// Admin console is air-gapped into @scrappy/admin (port 4001) with email allowlist & Supabase MFA AAL2.
// No public route exists in the web app.
export default function AdminPage() {
  notFound();
}
