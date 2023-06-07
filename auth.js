import { deleteCookie, getCookies, setCookie } from "std/http/cookie.ts";
import "std/dotenv/load.ts";
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.0/mod.ts";
import { Database } from "./database.js";

const db = await Database.open();

export async function getUser(req) {
  const cookies = getCookies(req.headers);
  const session = cookies.session;
  const user = await db.getUserBySession(session);
  return user;
}

const oauth2Client = new OAuth2Client({
  clientId: Deno.env.get("GITHUB_CLIENT_ID"),
  clientSecret: Deno.env.get("GITHUB_CLIENT_SECRET"),
  authorizationEndpointUri: "https://github.com/login/oauth/authorize",
  tokenUri: "https://github.com/login/oauth/access_token",
  defaults: {
    scope: "read:user",
  },
});

async function getAuthenticatedUser(token) {
  const resp = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${token}`,
    },
  });
  if (!resp.ok) {
    throw new Error("Failed to fetch user");
  }
  return await resp.json();
}

export class AuthController {
  static async oauth2callback(req) {
    const cookies = getCookies(req.headers);
    const oauthSessionCookie = cookies["oauth-session"];
    if (!oauthSessionCookie) {
      return new Response("Missing oauth session", {
        status: 400,
      });
    }
    const oauthSession = await db.getAndDeleteOauthSession(oauthSessionCookie);
    if (!oauthSession) {
      return new Response("Missing oauth session", {
        status: 400,
      });
    }
    const { state, codeVerifier } = oauthSession;
    const tokens = await oauth2Client.code.getToken(req.url, {
      state,
      codeVerifier,
    });

    const ghUser = await getAuthenticatedUser(tokens.accessToken);

    const session = crypto.randomUUID();
    const user = {
      id: String(ghUser.id),
      login: ghUser.login,
      name: ghUser.name,
      avatarUrl: ghUser.avatar_url,
    };
    await db.setUserWithSession(user, session);

    const resp = new Response("Logged in", {
      headers: {
        Location: "/",
      },
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

  static async signin(req) {
    const oauthSession = crypto.randomUUID();
    const state = crypto.randomUUID();
    const { uri, codeVerifier } = await oauth2Client.code
      .getAuthorizationUri({ state });
    db.setOauthSession(oauthSession, { state, codeVerifier });
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

  static async signout(req) {
    const cookies = getCookies(req.headers);
    const session = cookies.session;
  
    if (session) await db.deleteSession(session);
    const resp = new Response("Logged out", {
      headers: {
        Location: "/",
      },
      status: 307,
    });
    deleteCookie(resp.headers, "session");
    return resp;
  }
}
