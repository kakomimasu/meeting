import { setCookie } from "std/http/cookie.ts";

export class Signin {
  async handle() {
    const oauthSession = crypto.randomUUID();
    const state = crypto.randomUUID();
    const { uri, codeVerifier } = await this.github.getAuthorizationUri(state);
    await this.db.setOauthSession(oauthSession, { state, codeVerifier });
    const resp = new Response("Redirecting...", {
      headers: {
        Location: uri.href,
      },
      status: 307,
    });
    setCookie(resp.headers, {
      name: "oauth-session",
      value: oauthSession,
      path: "/",
      httpOnly: true,
    });
    return resp;
  }
}
