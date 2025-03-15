// packages/web/src/hooks.server.ts
import { redirect, type Handle } from "@sveltejs/kit";
import { authClient, setTokens } from "$lib/auth/auth.server";
import { subjects } from "../../functions/src/auth/subjects";

// exclusion list for unprotected public routes
const unprotected = ["/callback", "/logout"];
// add login to unprotected routes if using your own login page
// unprotected.push("/login");

export const handle: Handle = async ({ event, resolve }) => {
  if (unprotected.some((path) => event.url.pathname.startsWith(path))) {
    return resolve(event);
  }

  const client = authClient(event);
  const accessToken = event.cookies.get("access_token");

  if (!accessToken) {
    // this will use the UI in the openauthJS library
    const { url } = await client.authorize(`${event.url.origin}/callback`, "code");
    throw redirect(302, url);
  }

  try {
    const refreshToken = event.cookies.get("refresh_token");
    const verified = await client.verify(subjects, accessToken, { refresh: refreshToken });

    if (verified.err) throw new Error(`Verification failed: ${verified.err.message}`);

    if (verified.tokens) setTokens(event, verified.tokens.access, verified.tokens.refresh);
    event.locals.session = verified.subject.properties; // { id, email, name }
    
    return resolve(event);
    
  } catch (e) {

    console.error("Error verifying token:", e);
    const { url } = await client.authorize(`${event.url.origin}/callback`, "code");
    throw redirect(302, url);
  }
};