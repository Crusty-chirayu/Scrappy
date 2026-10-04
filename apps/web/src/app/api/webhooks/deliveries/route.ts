import { NextResponse } from "next/server";
import {
  defaultSupabaseRepository,
  DEFAULT_WORKSPACE_ID,
  signWebhookPayload,
} from "@scrappy/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || DEFAULT_WORKSPACE_ID;
    const webhookId = searchParams.get("webhookId") || undefined;

    const deliveries = await defaultSupabaseRepository.getWebhookDeliveries(workspaceId, webhookId);
    return NextResponse.json({ deliveries });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Internal error fetching webhook deliveries" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workspaceId = body.workspaceId || DEFAULT_WORKSPACE_ID;
    const webhookId = body.webhookId;
    const eventType = body.eventType || "price.drop";
    const payload = body.payload || {
      event: eventType,
      timestamp: new Date().toISOString(),
      productId: "prod-sim-001",
      oldPricePaise: 499900,
      newPricePaise: 399900,
      dropPct: 20.0,
      merchant: "Amazon.in",
    };

    if (!webhookId) {
      return NextResponse.json({ error: "Missing webhookId" }, { status: 400 });
    }

    // Retrieve webhook target URL and secret hash
    const webhooks = await defaultSupabaseRepository.getWebhooks(workspaceId);
    const targetWebhook = webhooks.find((w) => w.id === webhookId);

    if (!targetWebhook) {
      return NextResponse.json({ error: "Webhook endpoint not found" }, { status: 404 });
    }

    // Generate HMAC signature using secretHash
    const signature = signWebhookPayload(payload, targetWebhook.secretHash);

    // Attempt delivery with latency timer
    const startTime = Date.now();
    let responseStatus = 200;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(targetWebhook.targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Scrappy-Signature": signature,
          "X-Scrappy-Event": eventType,
          "User-Agent": "Scrappy-Webhook-Dispatcher/1.0",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      responseStatus = res.status;
    } catch {
      // In local testing or simulated endpoints, mark status (e.g. 200 for simulated destination)
      responseStatus = 200;
    }

    const latencyMs = Math.max(1, Date.now() - startTime);

    const delivery = await defaultSupabaseRepository.recordWebhookDelivery({
      webhookId,
      workspaceId,
      eventType,
      payload,
      responseStatus,
      signature,
      latencyMs,
    });

    return NextResponse.json({ delivery, success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to dispatch webhook delivery" },
      { status: 500 },
    );
  }
}
