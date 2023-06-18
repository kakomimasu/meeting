import { Comment } from "@/utils/comment.ts";
import {
  keyList,
  loadMessages,
  write,
  writeMessage,
} from "@/utils/database.ts";
import { Handlers } from "$fresh/server.ts";
import { User } from "@/utils/database.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    const user = ctx.state.user;
    if (!user) {
      return new Response(null, { status: 403 });
    }

    const accept = req.headers.get("accept");
    if (accept === "text/event-stream") {
      const body = connect();
      return new Response(body, {
        headers: {
          "content-type": "text/event-stream",
        },
      });
    }
    const data = await load();
    // const data = await getList();
    return Response.json(data);
  },
  async POST(req, ctx) {
    const user = ctx.state.user;
    if (!user) {
      return new Response(null, { status: 403 });
    }

    const form = await req.formData();
    const msg = form.get("msg") as string;
    await post(msg);
    // await post2(user, msg);
    return Response.json({ ok: true });
  },
};

function connect() {
  const bc = new BroadcastChannel(`chat`);
  const body = new ReadableStream({
    start(controller) {
      bc.addEventListener("message", async () => {
        try {
          const data = await loadMessages();
          const chunk = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(new TextEncoder().encode(chunk));
        } catch (e) {
          // console.error(`Error refreshing chat`, e);
        }
      });
      // console.log("Opened stream");
    },
    cancel() {
      bc.close();
      // console.log("Closed stream");
    },
  });
  return body;
}

async function getList() {
  // キーが chat- から始まるリストを取得
  const dbCommentList = await keyList("chat-");

  const commentList = [];
  for await (const dbComment of dbCommentList) {
    commentList.push(JSON.stringify(dbComment));
  }
  return commentList;
}

async function post2(user: User, message: string) {
  const comment = new Comment(user, message);
  await write("chat-" + comment.id, comment);
  // await writeMessage(JSON.stringify(comment));

  // // below test
  // const bc = new BroadcastChannel(`chat`);
  // bc.postMessage("" + Date.now());
}

async function post(msg: string) {
  await writeMessage(msg);
  const bc = new BroadcastChannel(`chat`);
  bc.postMessage("" + Date.now());
}

async function load() {
  return await loadMessages();
}
