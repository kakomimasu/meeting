import { contentType } from "$std/media_types/mod.ts";
import { extname } from "$std/path/mod.ts";
import { Handlers } from "$fresh/server.ts";
import { State } from "@/utils/types.ts";
import { saveFile } from "@/utils/database.ts";

export const handler: Handlers<null, State> = {
  async POST(req, ctx) {
    const user = ctx.state.user;
    if (!user) {
      return new Response(null, {
        status: 403,
      });
    }
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const body = new Uint8Array(await file!.arrayBuffer());

    const filename = form.get("filename") as string;
    const ctype = contentType(extname(filename));

    const fileId = crypto.randomUUID().toString();
    const stream = new Response(body).body;
    if (!stream) {
      return new Response(null, { status: 400 });
    }

    const comment = {
      id: crypto.randomUUID().toString(),
      user,
      message: "ファイル",
      createdAt: new Date(),
      isDeleted: false,
      fileId,
      contentType: ctype,
    };

    await saveFile(fileId, stream, ctype, comment);

    const bc = new BroadcastChannel(`chat`);
    bc.postMessage("" + Date.now());
    return Response.json({ ok: true });
  },
};
