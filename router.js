import { serveDir } from "std/http/file_server.ts";
import { getCookies } from "std/http/cookie.ts";

export class Router {
  constructor(
    { db, signin, signout, oauthCallback, chatHandler, userHandler },
  ) {
    this.db = db;
    this.signin = signin;
    this.signout = signout;
    this.oauthCallback = oauthCallback;
    this.chatHandler = chatHandler;
    this.userHandler = userHandler;
  }

  async handle(req) {
    const { pathname } = new URL(req.url);
    const cookie = getCookies(req.headers);
    const user = await this.db.getUserBySession(cookie.session);
    if (pathname == "/auth/signin") {
      return await this.signin.handle();
    } else if (pathname == "/auth/signout") {
      return await this.signout.handle(req);
    } else if (pathname == "/auth/oauth2callback") {
      return await this.oauthCallback.handle(req);
    } else if (pathname == "/chat") {
      return await this.chatHandler.handle(req);
    } else if (pathname == "/user") {
      return await this.userHandler.handle(user);
    } else {
      return serveDir(req, { fsRoot: "./static/" });
    }
  }
}
