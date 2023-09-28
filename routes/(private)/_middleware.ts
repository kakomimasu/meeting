import { getUserBySession } from "@/utils/database.ts";
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getSessionId } from "@/utils/github.ts";
import { State } from "@/utils/types.ts";

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    return new Response(null, { status: 403 });
  }
  const user = await getUserBySession(sessionId);
  if (!user) {
    return new Response(null, { status: 403 });
  }
  ctx.state.user = user;
  return await ctx.next();
}
