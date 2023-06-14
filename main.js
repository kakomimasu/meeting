import "std/dotenv/load.ts";
import { serve } from "std/http/server.ts";
import { serveDir } from "std/http/file_server.ts";
import { getCookies } from "std/http/cookie.ts";
import { getUserBySession } from "./database.js";
import { handleSignin } from "./signin.js";
import { handleSignout } from "./signout.js";
import { handleOAuthCallback } from "./oauth_callback.js";
import { handleChat } from "./chat_handler.js";
import { handleSkywayToken } from "./skyway.js"

serve(async (req) => {
  const { pathname } = new URL(req.url);
  const cookie = getCookies(req.headers);
  const user = await getUserBySession(cookie.session);
  // console.log("user", user);

  switch (pathname) {
    case "/auth/signin":
      return await handleSignin();
    case "/auth/signout":
      return await handleSignout(req);
    case "/auth/oauth2callback":
      return await handleOAuthCallback(req);
    case "/chat":
      if (!user) {
        return new Response(null, { status: 403 });
      }
      return await handleChat(req, user.login);
    case "/user":
      return Response.json(user);
    case "/skyway/token":
      return handleSkywayToken(req, user.login);
    default:
      return serveDir(req, { fsRoot: "./static/" });
  }
});
