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

// オブジェクトを作成する
const kv = await Deno.openKv();
const db = new Database();
const github = new GitHub();
const signin = new Signin();
const signout = new Signout();
const oauthCallback = new OAuthCallback();
const chatHandler = new ChatHandler();
const userHandler = new UserHandler();
const router = new Router();
const oauthClient = new OAuth2Client({
  clientId: Deno.env.get("GITHUB_CLIENT_ID"),
  clientSecret: Deno.env.get("GITHUB_CLIENT_SECRET"),
  authorizationEndpointUri: "https://github.com/login/oauth/authorize",
  tokenUri: "https://github.com/login/oauth/access_token",
  defaults: {
    scope: "read:user",
  },
});

// オブジェクトを接続する
db.kv = kv;
oauthCallback.db = db;
signin.db = db;
signin.github = github;
signout.db = db;
oauthCallback.db = db;
oauthCallback.github = github;
chatHandler.db = db;
github.oauthClient = oauthClient;
router.db = db;
router.oauthCallback = oauthCallback;
router.signin = signin;
router.signout = signout;
router.chatHandler = chatHandler;
router.userHandler = userHandler;

serve(async (req) => await router.handle(req));
