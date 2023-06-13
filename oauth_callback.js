import { deleteCookie, getCookies, setCookie } from "std/http/cookie.ts";

export class OAuthCallback {
  constructor({ db, github }) {
    this.db = db;
    this.github = github;
  }

  async handle(req) {
    const cookies = getCookies(req.headers);
    const oauthSessionCookie = cookies["oauth-session"];
    if (!oauthSessionCookie) {
      return new Response("Missing oauth session", { status: 400 });
    }
    const oauthSession = await this.db.getAndDeleteOauthSession(
      oauthSessionCookie,
    );
    if (!oauthSession) {
      return new Response("Missing oauth session", { status: 400 });
    }
    const ghUser = await this.github.getAuthenticatedUser(req, oauthSession);
    const session = crypto.randomUUID();
    await this.db.setUserWithSession({
      id: String(ghUser.id),
      login: ghUser.login,
      name: ghUser.name,
      avatarUrl: ghUser.avatar_url,
    }, session);
    const resp = new Response("Logged in", {
      headers: { Location: "/" },
      status: 307,
    });
    deleteCookie(resp.headers, "oauth-session");
    setCookie(resp.headers, {
      name: "session",
      value: session,
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
    });
    return resp;
  }
}
