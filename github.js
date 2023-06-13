export class GitHub {
  constructor({ oauthClient }) {
    this.oauthClient = oauthClient;
  }

  async getAuthorizationUri(state) {
    return await this.oauthClient.code.getAuthorizationUri({ state });
  }

  async getAuthenticatedUser(req, oauthSession) {
    const { state, codeVerifier } = oauthSession;
    const token = await this.oauthClient.code.getToken(req.url, {
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
