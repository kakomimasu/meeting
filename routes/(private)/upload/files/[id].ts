import { Handlers } from "$fresh/server.ts";
import { State } from "@/utils/types.ts";
import { loadFile } from "@/utils/database.ts";

export const handler: Handlers<null, State> = {
  async GET(_req, ctx) {
    const fileId = ctx.params.id;
    const { body, contentType } = await loadFile(fileId);
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
