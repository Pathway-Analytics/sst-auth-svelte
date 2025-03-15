// packages/web/src/lib/auth/auth.server.ts
import { createClient } from "@openauthjs/openauth/client"
import type { RequestEvent } from "@sveltejs/kit"

export function authClient(event: RequestEvent) {
  return createClient({
    // Match packages/functions/src/auth/auth.ts clientID
    // this is ignored by google provider 
    // perhaps we should set it according to the provider in the session
    clientID: process.env.GITHUB_CLIENT_ID || "sst-auth-svelte-example", 
    issuer: import.meta.env.VITE_AUTH_URL,
    fetch: event.fetch,
  })
}

// packages/web/src/lib/auth/auth.server.ts
export function setTokens(event: RequestEvent, access: string, refresh: string) {
  console.log("Setting cookies: access=", access, "refresh=", refresh);
  event.cookies.set("refresh_token", refresh, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 34560000,
    secure: false, // For local dev
  });
  event.cookies.set("access_token", access, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 34560000,
    secure: false,
  });
  console.log("Cookies set complete");
}