import { deleteCookie, getCookies, setCookie } from "$std/http/cookie.ts";
import {
  getAndDeleteOauthSession,
  setUserWithSession,
} from "@/utils/database.ts";
import {
  getAuthenticatedUser,
  getMemberOfOrganization,
  getSessionAccessToken,
  handleCallback,
} from "@/utils/github.ts";
import { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";

export const handler: Handlers<null, State> = {
  async GET(req) {
    const { response, sessionId } = await handleCallback(req);
    const ghUser = await getAuthenticatedUser(sessionId);

    if (
      ghUser.login != "ninja03" && ghUser.login != "takameron" &&
      ghUser.login != "kamekyame"
    ) {
      return new Response("not member", { status: 400 });
    }

    await setUserWithSession({
      id: String(ghUser.id),
      login: ghUser.login,
      name: ghUser.name,
      avatarUrl: ghUser.avatar_url,
    }, sessionId);

    return response;
    /*
    console.log(req);
    const cookies = getCookies(req.headers);
    console.log(cookies);
    const oauthSessionCookie = cookies["oauth-session"];
    if (!oauthSessionCookie) {
      return new Response("Missing oauth session", { status: 400 });
    }
    const oauthSession = await getAndDeleteOauthSession(
      oauthSessionCookie,
    );
    if (!oauthSession) {
      return new Response("Missing oauth session", { status: 400 });
    }
    const ghUser = await getAuthenticatedUser(req, oauthSession);
    console.log(awaitgetMemberOfOrganization(req, oauthSession, "kakomimasu"));

    if (
      ghUser.login != "ninja03" && ghUser.login != "takameron" &&
      ghUser.login != "kamekyame"
    ) {
      return new Response("not member", { status: 400 });
    }

    const session = crypto.randomUUID();
    await setUserWithSession({
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
    */
  },
};
