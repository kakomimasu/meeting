import { getCookies } from "$std/http/cookie.ts";
import { getUserBySession } from "@/utils/database.ts";
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { User } from "@/utils/types.ts";
import { getSessionId } from "@/utils/github.ts";

export interface State {
  user: User | null;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  // const cookie = getCookies(req.headers);
  const sessionId = await getSessionId(req);
  if (sessionId) {
    ctx.state.user = await getUserBySession(sessionId);
  }
  return await ctx.next();
}
