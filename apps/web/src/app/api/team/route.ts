import { NextResponse } from "next/server";
import {
  defaultSupabaseRepository,
  DEFAULT_WORKSPACE_ID,
} from "@scrappy/db";

const MAILPIT_URL = process.env.MAILPIT_API_URL || "http://127.0.0.1:55324";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || DEFAULT_WORKSPACE_ID;

    const [members, invitations] = await Promise.all([
      defaultSupabaseRepository.getTeamMembers(workspaceId),
      defaultSupabaseRepository.getTeamInvitations(workspaceId),
    ]);

    return NextResponse.json({ members, invitations });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Internal error fetching team" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workspaceId = body.workspaceId || DEFAULT_WORKSPACE_ID;
    const email = body.email;
    const role = body.role || "member";

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email address required" }, { status: 400 });
    }

    if (role !== "admin" && role !== "member") {
      return NextResponse.json({ error: "Role must be 'admin' or 'member'" }, { status: 400 });
    }

    const invitation = await defaultSupabaseRepository.createTeamInvitation({
      workspaceId,
      email,
      role,
    });

    // Send invitation email via local Mailpit emulator
    try {
      const inviteUrl = `http://localhost:3005/auth/invite?token=${invitation.token}`;
      await fetch(`${MAILPIT_URL}/api/v1/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          From: { Email: "team@scrappy.io", Name: "SCRAPPY Team" },
          To: [{ Email: invitation.email }],
          Subject: `You've been invited to join SCRAPPY workspace`,
          Text: `You have been invited to join the SCRAPPY workspace as ${role.toUpperCase()}.\n\nClick here to accept:\n${inviteUrl}`,
          HTML: `<p>You have been invited to join the <strong>SCRAPPY</strong> workspace as <strong>${role.toUpperCase()}</strong>.</p><p><a href="${inviteUrl}">Click here to accept invitation</a></p>`,
        }),
      });
    } catch (mailErr) {
      console.warn("Mailpit dispatch skipped or failed:", mailErr);
    }

    return NextResponse.json({ invitation, success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to create invitation" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || DEFAULT_WORKSPACE_ID;
    const invitationId = searchParams.get("invitationId");
    const memberId = searchParams.get("memberId");

    if (invitationId) {
      const success = await defaultSupabaseRepository.revokeTeamInvitation(workspaceId, invitationId);
      return NextResponse.json({ success, type: "invitation_revoked" });
    }

    if (memberId) {
      const success = await defaultSupabaseRepository.removeTeamMember(workspaceId, memberId);
      return NextResponse.json({ success, type: "member_removed" });
    }

    return NextResponse.json({ error: "Missing invitationId or memberId" }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to remove member or invitation" },
      { status: 500 },
    );
  }
}
