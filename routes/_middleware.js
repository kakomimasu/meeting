import { getCookies } from "$std/http/cookie.ts";
import { getUserBySession } from "@/utils/database.js";

export async function handler(req, ctx) {
  const cookie = getCookies(req.headers);
  ctx.state.user = await getUserBySession(cookie.session);
  return await ctx.next();
}
