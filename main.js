import { serve } from "std/http/server.ts";
import { serveDir } from "std/http/file_server.ts";
import { renderFileToString } from "dejs/mod.ts";
import { Chat } from "./chat.js";
import { Router } from "./routes.js";
import { Database } from "./database.js";

const db = await Database.open();
const chat = new Chat(db);
const router = new Router(db);

router.add("GET", "/", async (req) => {
  return new Response(
    await renderFileToString("index.ejs"),
    {
      headers: { "content-type": "text/html" },
    },
  );
});

router.add("GET", "/chat", async (req) => {
  const accept = req.headers.get("accept");
  if (accept === "text/event-stream") {
    const body = chat.connect();
    return new Response(body, {
      headers: {
        "content-type": "text/event-stream",
      },
    });
  }
  const data = await chat.load();
  return Response.json(data);
});

router.add("POST", "/chat", async (req) => {
  const form = await req.formData();
  const msg = form.get("msg");
  await chat.post(msg);
  return Response.json({ ok: true });
});

serve(async (req) => {
  const handler = router.get(req);
  if (handler) {
    return await handler(req);
  }
  return serveDir(req, { fsRoot: "./static/" });
});
