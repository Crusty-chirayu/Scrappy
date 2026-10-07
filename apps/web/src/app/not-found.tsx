import Link from "next/link";
import { Button } from "@scrappy/ui";
import { Compass, ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 sm:py-32 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--color-accent)] mb-6 shadow-xs">
        <Compass size={32} />
      </div>

      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-3)] text-xs font-mono font-medium mb-3">
        <span>ERROR 404 • ROUTE UNRESOLVED</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-display font-semibold text-[var(--text-1)] tracking-tight">
        Record or Route Not Found
      </h1>

      <p className="text-xs sm:text-sm text-[var(--text-3)] mt-3 font-mono max-w-md leading-relaxed">
        The requested entity, product comparison, or dataset route does not exist, has expired, or has been relocated.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
        <Link href="/compare">
          <Button variant="primary" size="sm" className="min-h-[42px] font-mono text-xs font-semibold gap-1.5">
            <span>Explore Catalog</span>
            <ArrowRight size={14} />
          </Button>
        </Link>
        <Link href="/">
          <Button variant="secondary" size="sm" className="min-h-[42px] font-mono text-xs gap-1.5">
            <Home size={14} />
            <span>Return Home</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
