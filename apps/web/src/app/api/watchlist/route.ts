import { NextResponse } from "next/server";
import {
  defaultSupabaseRepository,
  DEFAULT_WORKSPACE_ID,
  DEFAULT_USER_ID,
} from "@scrappy/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || DEFAULT_WORKSPACE_ID;
    const productId = searchParams.get("productId");

    if (productId) {
      const isSaved = await defaultSupabaseRepository.isWatchlisted(workspaceId, productId);
      return NextResponse.json({ isWatchlisted: isSaved });
    }

    const items = await defaultSupabaseRepository.getWatchlist(workspaceId);
    return NextResponse.json({ items });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Internal error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workspaceId = body.workspaceId || DEFAULT_WORKSPACE_ID;
    const userId = body.userId || DEFAULT_USER_ID;
    const productId = body.productId;

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const item = await defaultSupabaseRepository.addToWatchlist(workspaceId, userId, productId);
    return NextResponse.json({ item, success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to add to watchlist" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || DEFAULT_WORKSPACE_ID;
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const success = await defaultSupabaseRepository.removeFromWatchlist(workspaceId, productId);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to remove from watchlist" },
      { status: 500 },
    );
  }
}
