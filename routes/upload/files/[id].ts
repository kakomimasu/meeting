import { get } from "kv_toolbox/blob.ts";
import { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import { kv } from "@/utils/database.ts";

export const handler: Handlers<null, State> = {
  async GET(_req, ctx) {
    const user = ctx.state.user;
    if (!user) {
      return new Response(null, { status: 403 });
    }
    const fileId = ctx.params.id;
    const body = await get(kv, ["files", fileId, "blob"]);
    const contentType =
      (await kv.get<string>(["files", fileId, "contentType"])).value;
    if (!contentType) {
      return new Response(null, { status: 500 });
    }
    return new Response(body, {
      headers: {
        "content-type": contentType,
      },
    });
  },
};
