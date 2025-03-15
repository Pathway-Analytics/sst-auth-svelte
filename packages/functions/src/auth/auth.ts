// packages/functions/src/auth/auth.ts
import { handle } from "hono/aws-lambda";
import { Hono } from "hono";
import { issuer } from "@openauthjs/openauth/issuer";
import { DynamoStorage } from "@openauthjs/openauth/storage/dynamo";
import { GoogleProvider } from "@openauthjs/openauth/provider/google";
import { GithubProvider } from "@openauthjs/openauth/provider/github";
import { PasswordProvider } from "@openauthjs/openauth/provider/password";
import { PasswordUI } from "@openauthjs/openauth/ui/password";
import { CodeProvider } from "@openauthjs/openauth/provider/code";
import { CodeUI } from "@openauthjs/openauth/ui/code";
import { Select } from "@openauthjs/openauth/ui/select";
import { Theme, THEME_SST } from "@openauthjs/openauth/ui/theme";
import { Resource } from "sst";
import { subjects } from "./subjects";
import { webcrypto } from "crypto";
import { sendEmail } from "../email/sender";

const app = new Hono();
const usersTable = Resource.UsersTable.name;

// Placeholder—replace with actual DB lookup if needed
async function getUser(emailAddress: string): Promise<string> {
  return "123";
}

// ensure globalThis.crypto is available for aws4fetch
// pollyfil webcrypto for Node.js
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as any;
}

interface TokenSet {
  access?: string;
  refresh?: string;
  id_token?: string;
  expiry?: number;
  raw?: { id_token?: string };
}

// Discriminated union for provider-specific shapes
type AuthValue =
  | { provider: "google"; tokenset: TokenSet; clientID: string }
  | { provider: "github"; tokenset: { access: string; refresh?: string }; clientID?: string }
  | { provider: "code"; clientID: string; email?: string }
  | { provider: "password"; email: string; clientID?: string };

const MY_THEME: Theme = {
  ...THEME_SST,
  title: process.env.APP_TITLE || "My App",
  favicon: process.env.APP_FAVICON || "https://example.com/favicon.ico",
  logo: {
    dark: process.env.APP_LOGO_LIGHT || "https://www.terminal.shop/images/logo-white.svg",
    light: process.env.APP_LOGO_DARK || "https://www.terminal.shop/images/logo-black.svg",
  },
  primary: { dark: "#1F4788", light: "#1F4788" },
  background: { dark: "black", light: "white" },
  font: { family: "IBM Plex Sans, sans-serif" },
  radius: "md",
};

const authApp = issuer({
  subjects,
  storage: DynamoStorage({ table: usersTable, pk: "userId", sk: "email" }),
  select: Select({
    providers: {
      google: { display: "Google" },
      github: { display: "GitHub" },
      password: { display: "Email & Password" },
      code: { display: "Email" },
    },
  }),
  theme: MY_THEME,
  providers: {
    google: GoogleProvider({
      clientID: Resource.GoogleClientID.value,
      clientSecret: Resource.GoogleClientSecret.value,
      scopes: ["email", "profile", "openid"],
    }),
    github: GithubProvider({
      clientID: Resource.GithubClientID.value,
      clientSecret: Resource.GithubClientSecret.value,
      scopes: ["read:user", "user:email"],
    }),
    password: PasswordProvider(
      PasswordUI({
        sendCode: async (email: string, code: string) => {
          const subject = "Password Reset Code";
          const body = `Your password reset code is: ${code}`;
          await sendEmail(email, subject, body);
          if (process.env.NODE_ENV === "development") {
            console.log(`Sent password reset code ${code} to ${email}`);
          }
        },
      })
    ),
    code: CodeProvider(
      CodeUI({
        sendCode: async (claims: Record<string, string>, code: string) => {
          const to = claims.email as string;
          const subject = "Your Login Code";
          const body = `Your code is: ${code}`;
          await sendEmail(to, subject, body);
          if (process.env.NODE_ENV === "development") {
            console.log(`Sent code ${code} to ${to}`);
          }
        },
      })
    ),
  },
  async success(ctx, value: AuthValue) {
    console.log("Success called with value:", JSON.stringify(value, null, 2));

    let userId: string;
    let email: string;
    let name: string;

    switch (value.provider) {
      case "code":
        if (!value.clientID) throw new Error("Missing clientID for Code provider");
        userId = await getUser(value.clientID); // Replace with DB lookup if intended
        email = value.email || "no-email";
        name = email.split("@")[0] || "no-name";
        break;

      case "google":
        if (!value.clientID) throw new Error("Missing clientID for Google provider");
        if (!value.tokenset) throw new Error("Missing tokenset for Google provider");
        const idToken = value.tokenset.id_token || value.tokenset.raw?.id_token;
        if (!idToken) throw new Error("Missing ID token for Google provider");
        const googlePayload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64").toString());
        userId = googlePayload.sub;
        email = googlePayload.email || "no-email";
        name = googlePayload.name || "no-name";
        break;

      case "github":
        if (!value.tokenset?.access) throw new Error("Missing access token for GitHub provider");
        const response = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${value.tokenset.access}`,
            Accept: "application/vnd.github+json",
          },
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch GitHub user data: ${response.status} - ${errorText}`);
        }
        const githubData = await response.json() as { id: number; email: string | null; name: string; login: string };
        userId = githubData.id.toString();
        email = githubData.email || `${githubData.id}@github.com`;
        name = githubData.name || githubData.login;
        break;

      case "password":
        if (!value.email) throw new Error("Missing email for Password provider");
        userId = `password-${value.email}`;
        email = value.email;
        name = email.split("@")[0] || "no-name";
        break;

      default:
        throw new Error(`Unsupported provider: ${(value as any).provider}`);
    }

    const user = { id: userId, email, name };
    console.log("User:", JSON.stringify(user, null, 2));
    return ctx.subject("user", user);
  },
});

app.get("/test", (c) => {
  console.log("Issuer routes:", authApp.routes);
  console.log("App routes:", app.routes);
  console.log("Available Resources:", Object.keys(Resource));
  return c.text("Auth server is running");
});

app.route("/", authApp);

export const handler = handle(app);