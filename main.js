import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { renderFileToString } from "https://deno.land/x/dejs@0.10.3/mod.ts";
import { Chat } from "./chat.js";
import { Router } from "./routes.js";

const chat = new Chat();
const router = new Router();

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
  console.log("post chat");
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
});
