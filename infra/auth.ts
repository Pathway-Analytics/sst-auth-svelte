// infra/auth.ts
import { usersTable, googleSecrets, githubSecrets } from "./storage";
import { email } from "./email";

export const auth = new sst.aws.Auth("AuthServer", {
    issuer: {
      handler: "packages/functions/src/auth/auth.handler",
      runtime: "nodejs20.x",
      environment: {
        // edit .env to match your assets
        REGION: process.env.DEFAULT_REGION || "us-east-1",
        DOMAIN: process.env.DOMAIN || "example.com",
        APP_TITLE: process.env.APP_TITLE || "Pathway AnalyticMy App",
        APP_FAVICON: process.env.APP_FAVICON || "https://example/icons/favicon.ico",
        APP_LOGO_DARK: process.env.APP_LOGO_DARK || "https://www.terminal.shop/images/logo-black.svg",
        APP_LOGO_LIGHT: process.env.APP_LOGO_LIGHT || "https://www.terminal.shop/images/logo-white.svg",
      },
      link: [ email, usersTable, ...googleSecrets, ...githubSecrets], // Link DynamoDB table and Google secrets
    },
    domain: {
    // edit DOMAIN ZONE in .env to match your domain and zone
      name: `auth-${$app.stage}.${process.env.DOMAIN}`,
      dns: sst.aws.dns({
        zone: process.env.ZONE,
      }),
      // authServer deploys to CDN sowe need to use cert from us-east-1 region
      cert: process.env.CDN_CERT, 
    },  
  });