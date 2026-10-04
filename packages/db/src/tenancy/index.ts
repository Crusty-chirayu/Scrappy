import { TenantIsolationError } from "@scrappy/core";
import { eq, SQL } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";

/**
 * Tenant scoping wrapper: Enforces workspace isolation on any tenant-scoped query.
 */
export function withWorkspaceFilter(workspaceColumn: PgColumn, currentWorkspaceId: string): SQL {
  if (!currentWorkspaceId || currentWorkspaceId.trim() === "") {
    throw new TenantIsolationError("UNKNOWN", "Unspecified workspace ID");
  }
  return eq(workspaceColumn, currentWorkspaceId);
}

/**
 * Validates that an entity retrieved belongs to the user's active workspace.
 */
export function assertWorkspaceMatch(
  entityWorkspaceId: string,
  currentWorkspaceId: string,
  entityId: string,
): void {
  if (entityWorkspaceId !== currentWorkspaceId) {
    throw new TenantIsolationError(currentWorkspaceId, entityId);
  }
}
