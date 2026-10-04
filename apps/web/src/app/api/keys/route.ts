import { NextResponse } from "next/server";
import {
  defaultSupabaseRepository,
  DEFAULT_WORKSPACE_ID,
} from "@scrappy/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || DEFAULT_WORKSPACE_ID;

    const keys = await defaultSupabaseRepository.getApiKeys(workspaceId);
    return NextResponse.json({ keys });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to fetch API keys" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workspaceId = body.workspaceId || DEFAULT_WORKSPACE_ID;
    const name = body.name?.trim();
    const scopes = body.scopes || ["read", "extract"];

    if (!name) {
      return NextResponse.json({ error: "API key name required" }, { status: 400 });
    }

    const { apiKey, plainSecret } = await defaultSupabaseRepository.createApiKey({
      workspaceId,
      name,
      scopes,
    });

    return NextResponse.json({
      apiKey,
      plainSecret,
      success: true,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to create API key" },
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
      return NextResponse.json({ error: "Missing API key ID" }, { status: 400 });
    }

    const success = await defaultSupabaseRepository.revokeApiKey(workspaceId, id);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to revoke API key" },
      { status: 500 },
    );
  }
}
