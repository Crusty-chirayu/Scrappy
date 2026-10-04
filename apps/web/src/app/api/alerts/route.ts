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
    const alerts = await defaultSupabaseRepository.getAlerts(workspaceId);
    return NextResponse.json({ alerts });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to load alerts" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workspaceId = body.workspaceId || DEFAULT_WORKSPACE_ID;
    const userId = body.userId || DEFAULT_USER_ID;
    const { productId, targetPricePaise, notificationChannel } = body;

    if (!productId || !targetPricePaise) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const alert = await defaultSupabaseRepository.createAlert({
      workspaceId,
      userId,
      productId,
      targetPricePaise,
      notificationChannel,
    });
    return NextResponse.json({ alert, success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to create alert" },
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
      return NextResponse.json({ error: "Missing alert id" }, { status: 400 });
    }

    const success = await defaultSupabaseRepository.deleteAlert(workspaceId, id);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to delete alert" },
      { status: 500 },
    );
  }
}
