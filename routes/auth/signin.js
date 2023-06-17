import { setCookie } from "$std/http/cookie.ts";
import { getAuthorizationUri } from "@/utils/github.js";
import { setOauthSession } from "@/utils/database.js";

export const handler = {
  async GET() {
    const oauthSession = crypto.randomUUID();
    const state = crypto.randomUUID();
    const { uri, codeVerifier } = await getAuthorizationUri(state);
    await setOauthSession(oauthSession, { state, codeVerifier });
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
  },
};
