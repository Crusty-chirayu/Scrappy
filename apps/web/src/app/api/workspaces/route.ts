import { NextResponse } from "next/server";
import { getSupabaseAdminClient, DEFAULT_WORKSPACE_ID } from "@scrappy/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const admin = getSupabaseAdminClient();

    if (!userId) {
      // Return default workspace
      const { data, error } = await admin
        .from("workspaces")
        .select("id, name, slug, plan, created_at")
        .eq("id", DEFAULT_WORKSPACE_ID)
        .single();

      if (error || !data) {
        return NextResponse.json({
          workspaces: [
            {
              id: DEFAULT_WORKSPACE_ID,
              name: "Default Workspace",
              slug: "default",
              plan: "starter",
              role: "owner",
            },
          ],
        });
      }

      return NextResponse.json({
        workspaces: [{ ...data, role: "owner" }],
      });
    }

    const { data: memberRows, error } = await admin
      .from("workspace_members")
      .select("role, workspaces (id, name, slug, plan, created_at)")
      .eq("user_id", userId);

    if (error || !memberRows || memberRows.length === 0) {
      // Fallback to default workspace
      return NextResponse.json({
        workspaces: [
          {
            id: DEFAULT_WORKSPACE_ID,
            name: "Default Workspace",
            slug: "default",
            plan: "starter",
            role: "owner",
          },
        ],
      });
    }

    interface WorkspaceRow {
      id: string;
      name: string;
      slug: string;
      plan: string;
      created_at: string;
    }

    const workspaces = memberRows.map((m) => {
      const ws = m.workspaces as unknown as WorkspaceRow;
      return {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        plan: ws.plan,
        role: m.role,
        createdAt: ws.created_at,
      };
    });

    return NextResponse.json({ workspaces });
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
    const { userId, name } = body;

    if (!userId || !name || typeof name !== "string") {
      return NextResponse.json(
        { error: "userId and name are required" },
        { status: 400 },
      );
    }

    const admin = getSupabaseAdminClient();
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`;

    const { data: ws, error: wsErr } = await admin
      .from("workspaces")
      .insert({
        name,
        slug,
        plan: "free",
      })
      .select("id, name, slug, plan, created_at")
      .single();

    if (wsErr || !ws) {
      throw new Error(wsErr?.message || "Failed to create workspace");
    }

    const { error: memErr } = await admin
      .from("workspace_members")
      .insert({
        workspace_id: ws.id,
        user_id: userId,
        role: "owner",
      });

    if (memErr) {
      throw new Error(memErr.message);
    }

    return NextResponse.json({
      workspace: {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        plan: ws.plan,
        role: "owner",
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to create workspace" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const workspaceId = body.workspaceId || DEFAULT_WORKSPACE_ID;
    const plan = body.plan;

    if (!plan) {
      return NextResponse.json({ error: "Missing plan" }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();
    const { data: ws, error: wsErr } = await admin
      .from("workspaces")
      .update({ plan })
      .eq("id", workspaceId)
      .select("id, name, slug, plan")
      .single();

    if (wsErr) {
      throw new Error(wsErr.message);
    }

    return NextResponse.json({
      workspace: ws,
      success: true,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to update workspace plan" },
      { status: 500 },
    );
  }
}
