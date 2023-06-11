import "std/dotenv/load.ts";
import { serve } from "std/http/server.ts";
import { Database } from "./database.js";
import { GitHub } from "./github.js";
import { Index } from "./index.js";
import { Signout } from "./signout.js";
import { Signin } from "./signin.js";
import { OAuthCallback } from "./oauth_callback.js";
import { Chat } from "./chat.js";
import { Router } from "./router.js";

// オブジェクトを作成する
const kv = await Deno.openKv();
const db = new Database();
const github = new GitHub();
const index = new Index();
const signin = new Signin();
const signout = new Signout();
const oauthCallback = new OAuthCallback();
const chat = new Chat();
const router = new Router();

// オブジェクトを接続する
db.kv = kv;
oauthCallback.db = db;
signin.db = db;
signin.github = github;
signout.db = db;
oauthCallback.db = db;
oauthCallback.github = github;
chat.db = db;
router.db = db;
router.index = index;
router.oauthCallback = oauthCallback;
router.signin = signin;
router.signout = signout;
router.chat = chat;

serve(async (req) => await router.handle(req));
