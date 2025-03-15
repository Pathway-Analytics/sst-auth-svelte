/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      defaultTags: {
        tags: {
          project: `sst-auth-svelte`,
          AppManagerCFNStackKey: `sst-auth-svelte-${input?.stage}`,
        },
      },
      name: "sst-auth-svelte",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      // region: process.env.DEFAULT_REGION || "us-east-1",
      region: "us-east-1",
    };
  },
  async run() {
    try {  
    const { email } = await import("./infra/email");
    const {
      usersTable, 
      googleSecrets, 
      githubSecrets 
    } = await import("./infra/storage");
    const { auth } = await import("./infra/auth");
    const { 
      web: webInstance, 
      frontendUrl 
    } = await import("./infra/web").then((module) => module.web({ auth }));
    } catch (error) {
      console.error("SST config error:", error);
      throw error;    }
  },
});
