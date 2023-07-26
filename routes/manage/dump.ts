import { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";

export const handler: Handlers<null, State> = {
  async GET(_, ctx) {
    // const user = ctx.state.user;
    // if (!user) {
    //   return new Response(null, { status: 403 });
    // }
    const kv = await Deno.openKv();
    const buf = [];
    for await (const user of kv.list({ prefix: [] })) {
      buf.push(user);
    }
    // for await (const comment of kv.list({ prefix: ["comments"] })) {
    //   buf.push(comment);
    // }
    return new Response(JSON.stringify(buf), {
      headers: {
        "content-type": "application/json",
      },
    });
  },
};
