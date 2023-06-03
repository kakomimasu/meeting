import { Head } from "$fresh/runtime.ts";
import { Handlers } from "$fresh/server.ts";
import ChatView from "../islands/ChatView.tsx";
import { loadMessages, writeMessage } from "../services/database.ts";

export const handler: Handlers = {
  GET: async (req, ctx) => {
    const accept = req.headers.get("accept");
    const url = new URL(req.url);

    if (accept === "text/event-stream") {
      const bc = new BroadcastChannel(`chat`);
      const body = new ReadableStream({
        start(controller) {
          bc.addEventListener("message", async () => {
            try {
              const data = await loadMessages();
              const chunk = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(new TextEncoder().encode(chunk));
            } catch (e) {
              console.error(`Error refreshing chat`, e);
            }
          });
          console.log(
            `Opened stream for chat remote ${JSON.stringify(ctx.remoteAddr)}`,
          );
        },
        cancel() {
          bc.close();
          console.log(
            `Closed stream for chat remote ${JSON.stringify(ctx.remoteAddr)}`,
          );
        },
      });
      return new Response(body, {
        headers: {
          "content-type": "text/event-stream",
        },
      });
    }
    const data = await loadMessages();
    const res = await ctx.render({ data });
    return res;
  },
  POST: async (req, ctx) => {
    const body = await req.json();
    console.log("body", body);
    await writeMessage(body.data);
    const bc = new BroadcastChannel(`chat`);
    bc.postMessage("" + Date.now());
    return Response.json({ ok: true });
  },
};

export default function Home({ data: { data } }) {
  return (
    <>
      <Head>
        <title>Fresh App</title>
      </Head>
      <ChatView initialData={data} />
    </>
  );
}
