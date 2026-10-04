import { NextResponse } from "next/server";
import {
  DEFAULT_WORKSPACE_ID,
} from "@scrappy/db";
import { defaultUsageMetering, UsageMetric } from "@scrappy/pricing";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || DEFAULT_WORKSPACE_ID;

    const summary = await defaultUsageMetering.getWorkspaceUsageSummary(workspaceId);
    return NextResponse.json({ summary });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Internal error fetching usage summary" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workspaceId = body.workspaceId || DEFAULT_WORKSPACE_ID;
    const metric = body.metric as UsageMetric;
    const quantity = Math.max(1, Number(body.quantity) || 1);
    const idempotencyKey = body.idempotencyKey || `usage-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    if (!metric) {
      return NextResponse.json({ error: "Missing metric name" }, { status: 400 });
    }

    const res = await defaultUsageMetering.recordUsage({
      workspaceId,
      metric,
      quantity,
      idempotencyKey,
    });

    return NextResponse.json({ ...res, success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to record usage" },
      { status: 500 },
    );
  }
}
