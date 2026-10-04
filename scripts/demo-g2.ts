import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "http://127.0.0.1:55321";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const MAILPIT_URL = "http://127.0.0.1:55324";

async function runG2Demo() {
  console.info("=== G2 LIVE AUTH & MULTI-TENANCY DEMO ===");
  const timestamp = Date.now();
  const email = `demo_g2_${timestamp}@scrappy.io`;
  const password = "Password123!Secure";
  const name = `Demo User ${timestamp}`;

  const client = createClient(SUPABASE_URL, ANON_KEY);
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  // 1. Sign up
  console.info(`\nStep 1: Signing up user ${email}...`);
  const { data: signUpData, error: signUpErr } = await client.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (signUpErr) throw signUpErr;
  const userId = signUpData.user!.id;
  console.info(`User created with ID: ${userId}`);

  // 2. Verify workspace created by trigger
  console.info("\nStep 2: Checking workspace provisioned by database trigger...");
  const { data: memberships, error: memberErr } = await admin
    .from("workspace_members")
    .select("role, workspace_id, workspaces(id, name, slug, plan)")
    .eq("user_id", userId);
  if (memberErr) throw memberErr;
  console.info("Workspace membership verified:", JSON.stringify(memberships, null, 2));

  // 3. Logout
  console.info("\nStep 3: Logging out active session...");
  await client.auth.signOut();
  console.info("Sign out successful.");

  // 4. Request Magic Link
  console.info(`\nStep 4: Requesting OTP/Magic Link for ${email}...`);
  const { error: otpErr } = await client.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: "http://localhost:3005/auth/callback" },
  });
  if (otpErr) throw otpErr;
  console.info("Magic link requested successfully.");

  // 5. Fetch message from Inbucket / Mailpit
  console.info("\nStep 5: Inspecting Inbucket/Mailpit for delivered email...");
  await new Promise((r) => setTimeout(r, 1000));
  const listRes = await fetch(`${MAILPIT_URL}/api/v1/messages`);
  const listData = (await listRes.json()) as {
    messages: Array<{ To: Array<{ Address: string }>; ID: string; Subject: string }>;
  };
  const msgMeta = listData.messages.find((m) =>
    m.To.some((to) => to.Address === email)
  );
  if (!msgMeta) throw new Error("Magic link email not found in Mailpit/Inbucket");
  console.info(`Found message in Inbucket: ID=${msgMeta.ID}, Subject="${msgMeta.Subject}"`);

  const detailRes = await fetch(`${MAILPIT_URL}/api/v1/message/${msgMeta.ID}`);
  const detail = (await detailRes.json()) as { Text: string; HTML: string };
  console.info("Mailpit text content:\n", detail.Text);
  console.info("Mailpit html content:\n", detail.HTML);
  
  // 6. Verify Magic Link via GET request to Auth Verify URL (or token_hash)
  console.info("\nStep 6: Following Magic Link to verify and obtain session...");
  const verifyUrl = detail.Text.match(/http:\/\/127\.0\.0\.1:55321\/auth\/v1\/verify\?[^\s\)]+/)?.[0];
  if (!verifyUrl) throw new Error("Could not find verify URL in email text");
  console.info(`Calling verify URL: ${verifyUrl}`);

  const verifyRes = await fetch(verifyUrl, { redirect: "manual" });
  console.info(`Verify HTTP status: ${verifyRes.status}`);
  const redirectLocation = verifyRes.headers.get("location");
  console.info(`Redirect Location: ${redirectLocation}`);

  if (!redirectLocation || !redirectLocation.includes("access_token")) {
    throw new Error(`Magic link verification failed. Redirect did not contain access_token: ${redirectLocation}`);
  }

  // Parse access token
  const fragment = redirectLocation.split("#")[1] || redirectLocation.split("?")[1];
  const params = new URLSearchParams(fragment);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  // Restore session in client
  const { data: sessionData, error: sessionErr } = await client.auth.setSession({
    access_token: accessToken!,
    refresh_token: refreshToken!,
  });
  if (sessionErr) throw sessionErr;

  console.info("Session Successfully Restored via Magic Link!");
  console.info(`Authenticated user ID: ${sessionData.user?.id}`);
  console.info(`Authenticated user email: ${sessionData.user?.email}`);
  console.info("\nSUCCESS: G2 Signup -> Workspace -> Logout -> Magic Link Login Verified.");
}

runG2Demo().catch((err) => {
  console.error("G2 Demo Failed:", err);
  process.exit(1);
});
