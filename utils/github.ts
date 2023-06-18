import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.0/mod.ts";
import { User } from "@/utils/database.ts";

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
  req: Request,
  oauthSession: OauthSession,
) {
  const { state, codeVerifier } = oauthSession;
  const token = await oauthClient.code.getToken(req.url, {
    state,
    codeVerifier,
  });
  const resp = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${token.accessToken}`,
    },
  });
  if (!resp.ok) {
    throw new Error("Failed to fetch user");
  }
  return await resp.json() as User;
}
