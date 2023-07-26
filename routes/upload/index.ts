import { set } from "kv_toolbox/blob.ts";
import { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import { kv } from "@/utils/database.ts";

export const handler: Handlers<null, State> = {
  async POST(req, ctx) {
    const user = ctx.state.user;
    if (!user) {
      return new Response(null, { status: 403 });
    }
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const body = new Uint8Array(await file!.arrayBuffer());
    const fileId = crypto.randomUUID().toString();
    const stream = new Response(body).body;
    if (!stream) {
      return new Response(null, { status: 400 });
    }
    await set(kv, ["files", fileId, "blob"], stream);
    await kv.set(["files", fileId, "contentType"], "image/png");
    const comment = {
      id: crypto.randomUUID().toString(),
      user,
      message: "ファイル",
      createdAt: new Date(),
      isDeleted: false,
      fileId,
    };

    await kv.set(["comments", comment.id], comment);

    const bc = new BroadcastChannel(`chat`);
    bc.postMessage("" + Date.now());
    return Response.json({ ok: true });
  },
};
