import { getCookies } from "$std/http/cookie.ts";
import { getUserBySession } from "@/utils/database.ts";
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { User } from "@/utils/database.ts";

export interface State {
  user: User;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  const cookie = getCookies(req.headers);
  ctx.state.user = await getUserBySession(cookie.session) as User;
  return await ctx.next();
}
