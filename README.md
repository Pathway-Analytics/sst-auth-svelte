# sst-auth-svelte #

A minimal SST v3 application with SvelteKit, DynamoDB, and OpenAuth for authentication.

## Features ##

- **Frontend**: SvelteKit with TypeScript
- **Backend**: SST v3 monorepo
- **Database**: DynamoDB for user attributes (email, name, id)
- **Auth**: OpenAuth with Google, GitHub, Password and Code issuers

## Setup ##

1. **Clone the repository**

```bash
git clone https://github.com/Pathway-Analytics/sst-auth-svelte.git
cd sst-auth-svelte
```

## Create an .env file in the project root with the following envvars ##

Assuming you are using AWS, add the Route 53 Zone ID, and domain you want to apply.

Add certificates for your domain in both us-east-1 and the region you want to set in sst.config.ts as the default region for your app, insert the certificate arns from each in the .env file below, sst will use us-east-1 if not specified.  

Any request made to a server using CDN will need to use a certificate hosted in us-east-1 (ie the frontend web server and the Auth server), any other servers will need to use a certificate hosted in the default region set in sst.config.ts (ie an API server).

```bash
ZONE = "[your aws Route 53 Zone ID]"
DOMAIN = "[yourdomain.com]"
DEFAULT_REGION = "[default region]"
DEFAULT_REGION_CERT = "arn:aws:acm:[default region]:[your aws account]:certificate/[certificate id]"
CDN_CERT = "arn:aws:acm:us-east-1:[your aws account]:certificate/[certificate id]"

APP_TITLE = `app title`
APP_FAVICON = https://example.com/icons/favicon.ico
```

Edit the etc/hosts file to include the following line to forward requests to local.yourdomain.com to localhost/127.0.0.1:

```bash
127.0.0.1 local.yourdomain.com
```

## create local certificate ##

Follow the [cert instructions](packages/web/src/certs/readme.md)

## Connect to your user database ##

Update function getUser in /packages/functions/src/auth/auth.ts to connect to your user db

## ToDo's: ##

- Fix UsersTable as Storage for AuthServer
- Offer option to register known users only
- Test for regions other than us-east-1