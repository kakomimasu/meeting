import { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import { Comment, User } from "@/utils/types.ts";

export const handler: Handlers<null, State> = {
  async GET(_, ctx) {
    // const user = ctx.state.user;
    // if (!user) {
    //   return new Response(null, { status: 403 });
    // }
    const kv = await Deno.openKv();
    for await (const user of kv.list({ prefix: [] })) {
      await kv.delete(user.key);
    }
    // for await (const comment of kv.list<Comment>({ prefix: ["comments"] })) {
    //   await kv.delete(comment.key);
    // }
    return new Response("リセットしました");
  },
};
