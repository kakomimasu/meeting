import * as kv_oauth from "kv_oauth";
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.0/mod.ts";

interface GitHubUser {
  id: string;
  login: string;
  name: string;
  avatar_url: string;
}

// const redirectUrl = new URL(
//   "/twitter/callback",
//   Deno.env.get("TWITTER_REDIRECT_BASEURL"),
// );

// /auth/oauth2callback

const oauth2Client = kv_oauth.createGitHubOAuth2Client({
  // redirectUri: redirectUrl.toString(),
  defaults: {
    scope: ["read:user"],
  },
});

export const signIn = (req: Request) => kv_oauth.signIn(req, oauth2Client);
export const signOut = (req: Request) => kv_oauth.signOut(req);
export const handleCallback = (req: Request) =>
  kv_oauth.handleCallback(req, oauth2Client);
export const getSessionId = (req: Request) => kv_oauth.getSessionId(req);
export const getSessionAccessToken = (sessionId: string) =>
  kv_oauth.getSessionAccessToken(oauth2Client, sessionId);

const oauthClient = new OAuth2Client({
  clientId: Deno.env.get("GITHUB_CLIENT_ID")!,
  clientSecret: Deno.env.get("GITHUB_CLIENT_SECRET"),
  authorizationEndpointUri: "https://github.com/login/oauth/authorize",
  tokenUri: "https://github.com/login/oauth/access_token",
  defaults: {
    scope: "read:user",
  },
});

export interface OauthSession {
  state: string;
  codeVerifier: string;
}

export async function getAuthorizationUri(state: string) {
  return await oauthClient.code.getAuthorizationUri({ state });
}

export async function getAuthenticatedUser(
  sessionId: string,
) {
  const token = await getSessionAccessToken(sessionId);
  /*
  const { state, codeVerifier } = oauthSession;
  const token = await oauthClient.code.getToken(req.url, {
    state,
    codeVerifier,
  });
  */
  const resp = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${token}`,
    },
  });
  if (!resp.ok) {
    throw new Error("Failed to fetch user");
  }
  return await resp.json() as GitHubUser;
}

// https://docs.github.com/en/rest/orgs/members?apiVersion=2022-11-28
export async function getMemberOfOrganization(
  req: Request,
  oauthSession: OauthSession,
  org: string,
) {
  const { state, codeVerifier } = oauthSession;
  const token = await oauthClient.code.getToken(req.url, {
    state,
    codeVerifier,
  });
  console.log(`token=${token}`);
  const resp = await fetch(`https://api.github.com/orgs/${org}/members`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token.accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!resp.ok) {
    throw new Error("Failed to fetch organization members");
  }
  return await resp.json() as GitHubUser[];
}
