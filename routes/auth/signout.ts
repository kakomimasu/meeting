import { deleteCookie, getCookies } from "$std/http/cookie.ts";
import { deleteSession } from "@/utils/database.ts";
import { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";

export const handler: Handlers<null, State> = {
  async GET(req) {
    const cookies = getCookies(req.headers);
    if (cookies.session) {
      await deleteSession(cookies.session);
    }
    const resp = new Response("Logged out", {
      headers: {
        Location: "/",
      },
      status: 307,
    });
    deleteCookie(resp.headers, "session");
    return resp;
  },
};
