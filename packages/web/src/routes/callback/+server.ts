// packages/web/src/routes/callback/+server.ts
import { redirect } from "@sveltejs/kit";
import { authClient, setTokens } from "$lib/auth/auth.server"; // Use authClient

export async function GET(event) {
  console.log("Callback handler started:", event.url.toString());
  const code = event.url.searchParams.get("code");
  console.log("Code received:", code);

  if (!code) {
    console.error("No code provided");
    throw redirect(302, "/?error=no_code");
  }

  const client = authClient(event);
  console.log("Auth client created, exchanging code...");
  try {
    const tokens = await client.exchange(code, event.url.origin + "/callback");
    console.log("Tokens from exchange:", JSON.stringify(tokens, null, 2));

    if (tokens.err) {
      console.error("Exchange error:", tokens.err);
      throw redirect(302, "/?error=exchange_failed");
    }

    const access = tokens.tokens?.access || "missing_access";
    const refresh = tokens.tokens?.refresh || "no_refresh";
    console.log("Extracted tokens: access=", access, "refresh=", refresh);

    setTokens(event, access, refresh);
    console.log("Cookies set complete");

    throw redirect(302, "/");
  } catch (error) {
    console.error("Exchange failed:", error);
    throw redirect(302, "/?error=callback_error");
  }
}