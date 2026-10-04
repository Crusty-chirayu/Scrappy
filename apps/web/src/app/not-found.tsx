import Link from "next/link";
import { Button, EmptyState } from "@scrappy/ui";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
      <EmptyState
        title="404 — Record Not Found"
        description="The requested entity, product comparison, or dataset route does not exist or has been relocated."
        action={
          <Link href="/compare">
            <Button variant="primary" size="sm">
              Return to Catalog
            </Button>
          </Link>
        }
        secondaryAction={
          <Link href="/">
            <Button variant="secondary" size="sm">
              Home
            </Button>
          </Link>
        }
      />
    </div>
  );
}
