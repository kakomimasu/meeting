import { deleteCookie, getCookies } from "std/http/cookie.ts";

export class Signout {
  constructor({ db }) {
    this.db = db;
  }

  async handle(req) {
    const cookies = getCookies(req.headers);
    if (cookies.session) {
      await this.db.deleteSession(cookies.session);
    }
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
