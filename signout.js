import { deleteCookie, getCookies } from "std/http/cookie.ts";
import { deleteSession } from "./database.js";

export async function handleSignout(req) {
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
}
