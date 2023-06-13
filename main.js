import "std/dotenv/load.ts";
import { serve } from "std/http/server.ts";
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.0/mod.ts";
import { Database } from "./database.js";
import { GitHub } from "./github.js";
import { Signout } from "./signout.js";
import { Signin } from "./signin.js";
import { OAuthCallback } from "./oauth_callback.js";
import { ChatHandler } from "./chat_handler.js";
import { UserHandler } from "./user_handler.js";
import { Router } from "./router.js";

// オブジェクトを作成して接続する
const oauthClient = new OAuth2Client({
  clientId: Deno.env.get("GITHUB_CLIENT_ID"),
  clientSecret: Deno.env.get("GITHUB_CLIENT_SECRET"),
  authorizationEndpointUri: "https://github.com/login/oauth/authorize",
  tokenUri: "https://github.com/login/oauth/access_token",
  defaults: {
    scope: "read:user",
  },
});
const kv = await Deno.openKv();
const db = new Database({ kv });
const github = new GitHub({ oauthClient });
const signin = new Signin({ db, github });
const signout = new Signout({ db });
const oauthCallback = new OAuthCallback({ db, github });
const chatHandler = new ChatHandler({ db });
const userHandler = new UserHandler();
const router = new Router({
  db,
  signin,
  signout,
  oauthCallback,
  chatHandler,
  userHandler,
});

serve(async (req) => await router.handle(req));
