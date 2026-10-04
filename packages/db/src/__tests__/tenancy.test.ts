import { describe, it, expect } from "vitest";
import { assertWorkspaceMatch, withWorkspaceFilter } from "../tenancy/index.js";
import { extractionTasks } from "../schema/index.js";

describe("Workspace Tenancy Isolation", () => {
  it("creates a workspace SQL filter expression", () => {
    const filter = withWorkspaceFilter(extractionTasks.workspaceId, "ws-12345");
    expect(filter).toBeDefined();
  });

  it("throws when workspace ID is blank", () => {
    expect(() => withWorkspaceFilter(extractionTasks.workspaceId, "")).toThrow();
  });

  it("passes when entity workspace matches active workspace", () => {
    expect(() => assertWorkspaceMatch("ws-100", "ws-100", "task-999")).not.toThrow();
  });

  it("throws TenantIsolationError when workspace does not match", () => {
    expect(() => assertWorkspaceMatch("ws-attacker", "ws-victim", "task-sensitive")).toThrow(
      /Access denied/,
    );
  });
});
