//infra/storage.ts

// Google secrets
// npx sst secret set GoogleClientID my-secret-value --fallback
// npx sst secret set GoogleClientSecret my-secret-value --fallback
// go to https://console.cloud.google.com/auth/clients 
// register origin URIs to https://[stage].[mydomain.com]:[port]
// register redirect URIs to https://auth-[stage].[mydomain.com]/google/callback
const googleClientID = new sst.Secret("GoogleClientID");
const googleClientSecret = new sst.Secret("GoogleClientSecret");
export const googleSecrets = [googleClientID,googleClientSecret];

// Github secrets
// npx sst secret set GithubClientID my-secret-value --fallback
// npx sst secret set GithubClientSecret my-secret-value --fallback
// go to https://github.com/settings/developers
// register homepage URL to https://[stage].[mydomain.com]:[port]
// 
const githubClientID = new sst.Secret("GithubClientID");
const githubClientSecret = new sst.Secret("GithubClientSecret");
export const githubSecrets = [githubClientID, githubClientSecret];

// DynamoDB table for OpenAuth users
export const usersTable = new sst.aws.Dynamo("UsersTable", {
    fields: {
      userId: "string",
      email: "string",
    },
    primaryIndex: { hashKey: "userId" },
    globalIndexes: {
      emailIndex: { hashKey: "email" },
    },
  });
  