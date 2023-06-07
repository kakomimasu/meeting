import { serve } from "std/http/server.ts";
import { serveDir } from "std/http/file_server.ts";
import { renderFileToString } from "dejs/mod.ts";
import { Chat } from "./chat.js";
import { Router } from "./routes.js";
import { Database } from "./database.js";
import { AuthController, getUser } from "./auth.js";

const db = await Database.open();
const chat = new Chat(db);
const router = new Router(db);

router.add("GET", "/", async (req) => {
  const user = await getUser(req);
  return new Response(
    await renderFileToString("index.ejs", { user }),
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
  // const data = await chat.load()
  const data = await chat.getList();
  return Response.json(data);
});

router.add("POST", "/chat", async (req) => {
  const form = await req.formData();
  const msg = form.get("msg");
  // await chat.post(msg);
  await chat.post2("user", msg)
  return Response.json({ ok: true });
});

router.add("GET", "/auth/oauth2callback", AuthController.oauth2callback);
router.add("GET", "/auth/signin", AuthController.signin);
router.add("GET", "/auth/signout", AuthController.signout);

serve(async (req) => {
  const handler = router.get(req);
  if (handler) {
    return await handler(req);
  }
  return serveDir(req, { fsRoot: "./static/" });
});
