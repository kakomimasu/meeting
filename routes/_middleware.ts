import { getUserBySession } from "@/utils/database.ts";
import { MiddlewareHandlerContext } from "$fresh/server.ts";
// import { User } from "@/utils/types.ts";
import { getSessionId } from "@/utils/github.ts";
import { State } from "@/utils/types.ts";

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  const sessionId = getSessionId(req);
  if (sessionId) {
    ctx.state.user = await getUserBySession(sessionId);
  }
  return await ctx.next();
}
