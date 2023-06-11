import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.0/mod.ts";

export class GitHub {
  constructor() {
    this.client = new OAuth2Client({
      clientId: Deno.env.get("GITHUB_CLIENT_ID"),
      clientSecret: Deno.env.get("GITHUB_CLIENT_SECRET"),
      authorizationEndpointUri: "https://github.com/login/oauth/authorize",
      tokenUri: "https://github.com/login/oauth/access_token",
      defaults: {
        scope: "read:user",
      },
    });
  }

  async getAuthorizationUri(state) {
    return await this.client.code.getAuthorizationUri({ state });
  }

  async getAuthenticatedUser(req, oauthSession) {
    const { state, codeVerifier } = oauthSession;
    const token = await this.client.code.getToken(req.url, {
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
    return await resp.json();
  }
}
