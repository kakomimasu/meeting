import { Handlers } from "$fresh/server.ts";
import { State } from "@/utils/types.ts";

export const handler: Handlers<null, State> = {
  async GET(_req, _ctx) {
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
