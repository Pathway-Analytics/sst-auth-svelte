// infra/web.ts

export function web({ auth }: { auth: sst.aws.Auth }) {
  // import  stage from app
    const frontendDomain = `${$app.stage}.${process.env.DOMAIN}`;
    const frontendUrl = `https://${frontendDomain}`;
    console.log("frontendUrl: ", frontendUrl);

    const webInstance = new sst.aws.SvelteKit("Frontend", {
      
      path: "packages/web",
      domain: {
        name: frontendDomain,  // vite.config.ts alters this for local dev $app.stage variable
        dns: sst.aws.dns({
          zone: process.env.ZONE, // Route53 hosted zone ID
        }),
        cert: process.env.CDN_CERT, // when we are in local live mode we will use the locally signed certificate
      },
      environment: {
        VITE_AUTH_URL: auth.url,
        VITE_FRONTEND_URL: frontendUrl,
        VITE_DOMAIN: process.env.DOMAIN || "localhost",
        // VITE_API_URL: api.url, // Injects API_URL into frontend if api it is passed in to the function web({ api})
      },
    });
  
    return {
      web: webInstance,
      frontendUrl: webInstance.url,
    };
  }