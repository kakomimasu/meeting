import { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import { Comment, User } from "@/utils/types.ts";
import {
  getComment,
  keyList,
  kv,
  loadMessages,
  write,
  writeMessage,
} from "@/utils/database.ts";

type KkmmHandlers<T> = Handlers<T, State>;

export const handler: KkmmHandlers<null> = {
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
    // const data = await load();
    const data = await getList();
    return Response.json(data);
  },
  async POST(req, ctx) {
    const user = ctx.state.user;
    if (!user) {
      return new Response(null, { status: 403 });
    }

    const form = await req.formData();
    const msg = form.get("msg") as string;
    const commentId = form.get("comment-id") as string;
    // await post(msg);
    await post2(user, msg, commentId);
    return Response.json({ ok: true });
  },
};

function connect() {
  const bc = new BroadcastChannel(`chat`);
  const body = new ReadableStream({
    start(controller) {
      bc.addEventListener("message", async () => {
        try {
          const data = await getList();
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
  // const list = kv.list({ prefix: ["chats"] });
  // let list2 = [];
  // for await (const k of list) {
  //   list2.push(k.value);
  // }
  // list2 = list2.sort((a: any, b: any) =>
  //   b.createdAt.getTime() - a.createdAt.getTime()
  // ).slice(0, 10);
  // console.log(list2.map((a) => a.text));
  // return list2;

  // キーが comments から始まるリストを取得
  const dbCommentList = keyList<Comment>("comments");

  const commentList = [];
  for await (const dbComment of dbCommentList) {
    commentList.push(dbComment.value);
  }
  // console.log(commentList);
  const sortedList = commentList.sort((a: any, b: any) =>
    b.createdAt.getTime() - a.createdAt.getTime()
  );
  return sortedList;
}

async function post2(user: User, message: string, commentId: string) {
  // commentIdがあれば上書きして終了
  console.log("commentId?.trim()", commentId?.trim());
  if (commentId?.trim()) {
    console.log("編集するよ");
    const comment = await getComment(commentId);
    if (comment == null) {
      return;
    }
    comment.message = message;
    await write(["comments", commentId], comment);
  } else {
    console.log("追加するよ");

    // const comment = new Comment(user, message);
    const comment = {
      id: crypto.randomUUID().toString(),
      user: user,
      message: message,
      createdAt: new Date(),
      isDeleted: false,
    };
    await write(["comments", comment.id], comment);
  }

  const bc = new BroadcastChannel(`chat`);
  bc.postMessage("" + Date.now());

  // await writeMessage(JSON.stringify(comment));

  // // below test
  // const bc = new BroadcastChannel(`chat`);
  // bc.postMessage("" + Date.now());

  // const id = crypto.randomUUID();
  // console.log("id", id);
  // await kv.set(["chats", id], {
  //   user,
  //   text: message,
  //   createdAt: new Date(),
  // });
}

async function post(msg: string) {
  await writeMessage(msg);
  const bc = new BroadcastChannel(`chat`);
  bc.postMessage("" + Date.now());
}

async function load() {
  return await loadMessages();
}
