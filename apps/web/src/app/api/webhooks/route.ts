import { NextResponse } from "next/server";
import {
  defaultSupabaseRepository,
  DEFAULT_WORKSPACE_ID,
} from "@scrappy/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || DEFAULT_WORKSPACE_ID;

    const webhooks = await defaultSupabaseRepository.getWebhooks(workspaceId);
    return NextResponse.json({ webhooks });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Internal error fetching webhooks" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workspaceId = body.workspaceId || DEFAULT_WORKSPACE_ID;
    const targetUrl = body.targetUrl;
    const events = body.events || ["price.drop", "extract.complete"];

    if (!targetUrl || typeof targetUrl !== "string") {
      return NextResponse.json({ error: "Target URL required" }, { status: 400 });
    }

    try {
      const u = new URL(targetUrl);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        return NextResponse.json({ error: "Only HTTP/HTTPS URLs permitted" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Malformed URL provided" }, { status: 400 });
    }

    const { webhook, rawSecret } = await defaultSupabaseRepository.createWebhook({
      workspaceId,
      targetUrl,
      events,
    });

    return NextResponse.json({
      webhook,
      secret: rawSecret,
      success: true,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to create webhook" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || DEFAULT_WORKSPACE_ID;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing webhook ID" }, { status: 400 });
    }

    const success = await defaultSupabaseRepository.deleteWebhook(workspaceId, id);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to delete webhook" },
      { status: 500 },
    );
  }
}
