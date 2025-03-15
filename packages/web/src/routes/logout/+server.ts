// packages/web/src/routes/logout/+server.ts
import { logout } from "$lib/auth/actions.server";

export async function GET(event) {
  console.log("Logout route hit");
  await logout(event); // Clears cookies and redirects to "/"
  // No need for additional redirect here
  return new Response(null, { status: 302, headers: { Location: "/" } });
}