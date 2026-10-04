import { RunStatus } from "./types.js";

/**
 * Valid state transitions for extractor execution.
 */
const VALID_TRANSITIONS: Record<RunStatus, RunStatus[]> = {
  DRAFT: ["VALIDATING", "QUEUED", "CANCELLED"],
  VALIDATING: ["QUEUED", "FAILED", "CANCELLED"],
  QUEUED: ["RUNNING", "CANCELLED"],
  RUNNING: ["RETRYING", "PARTIAL", "SUCCEEDED", "FAILED", "CANCELLED"],
  RETRYING: ["RUNNING", "FAILED", "CANCELLED"],
  PARTIAL: [], // Terminal
  SUCCEEDED: [], // Terminal
  FAILED: [], // Terminal
  CANCELLED: [], // Terminal
};

export class InvalidStateTransitionError extends Error {
  constructor(public readonly current: RunStatus, public readonly target: RunStatus) {
    super(`Cannot transition extractor run from '${current}' to '${target}'.`);
    this.name = "InvalidStateTransitionError";
  }
}

export function canTransition(current: RunStatus, target: RunStatus): boolean {
  const allowed = VALID_TRANSITIONS[current] || [];
  return allowed.includes(target);
}

export function transitionState(current: RunStatus, target: RunStatus): RunStatus {
  if (!canTransition(current, target)) {
    throw new InvalidStateTransitionError(current, target);
  }
  return target;
}

export function isTerminalState(status: RunStatus): boolean {
  return ["PARTIAL", "SUCCEEDED", "FAILED", "CANCELLED"].includes(status);
}
