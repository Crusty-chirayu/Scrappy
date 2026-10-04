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

    const searches = await defaultSupabaseRepository.getSavedSearches(workspaceId);
    return NextResponse.json({ searches });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Internal error fetching saved searches" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workspaceId = body.workspaceId || DEFAULT_WORKSPACE_ID;
    const userId = body.userId || DEFAULT_USER_ID;
    const query = body.query;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Missing or invalid search query" }, { status: 400 });
    }

    const search = await defaultSupabaseRepository.createSavedSearch({
      workspaceId,
      userId,
      query: query.trim(),
      filters: body.filters || {},
      notifyOnNew: body.notifyOnNew ?? false,
    });

    return NextResponse.json({ search, success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to create saved search" },
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
      return NextResponse.json({ error: "Missing search ID" }, { status: 400 });
    }

    const success = await defaultSupabaseRepository.deleteSavedSearch(workspaceId, id);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to delete saved search" },
      { status: 500 },
    );
  }
}
