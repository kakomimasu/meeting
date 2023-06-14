import { deleteCookie, getCookies, setCookie } from "std/http/cookie.ts";
import { getAndDeleteOauthSession, setUserWithSession } from "./database.js";
import { getAuthenticatedUser } from "./github.js";

export const handleOAuthCallback = async (req) => {
  const cookies = getCookies(req.headers);
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
};
