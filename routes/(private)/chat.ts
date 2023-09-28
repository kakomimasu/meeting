import { Handlers } from "$fresh/server.ts";
import { State } from "@/utils/types.ts";
import { Comment, User } from "@/utils/types.ts";
import { getComment, keyListComment, writeComment } from "@/utils/database.ts";

type KkmmHandlers<T> = Handlers<T, State>;

export const handler: KkmmHandlers<null> = {
  async GET(req, _ctx) {
    const accept = req.headers.get("accept");
    if (accept === "text/event-stream") {
      const body = connect();
      return new Response(body, {
        headers: {
          "content-type": "text/event-stream",
        },
      });
    }
    const data = await getList();
    return Response.json(data);
  },

  async POST(req, ctx) {
    const user = ctx.state.user;
    const form = await req.formData();
    const msg = form.get("msg") as string;
    const commentId = form.get("comment-id") as string;
    if (user == null) {
      return Response.json({ ok: true });
    }

    await post(user, msg, commentId);
    return Response.json({ ok: true });
  },
};

function connect() {
  const bc = new BroadcastChannel(`chat`);
  const body = new ReadableStream({
    start(controller) {
      bc.addEventListener("message", async () => {
        const data = await getList();
        const chunk = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(new TextEncoder().encode(chunk));
      });
    },
    cancel() {
      bc.close();
    },
  });
  return body;
}

async function getList() {
  // キーが comments から始まるリストを取得
  const dbCommentList = keyListComment();

  const commentList = [];
  for await (const dbComment of dbCommentList) {
    commentList.push(dbComment.value);
  }
  return commentList;
}

async function post(user: User, message: string, commentId?: string) {
  // commentIdがあれば上書きして終了
  if (commentId && commentId?.trim()) {
    const comment = await getComment(commentId);
    if (comment == null) {
      return;
    }
    comment.message = message;
    await writeComment(comment);
  } else {
    const comment: Comment = {
      id: crypto.randomUUID().toString(),
      user: user,
      message: message,
      createdAt: new Date(),
      isDeleted: false,
    };
    await writeComment(comment);
  }

  const bc = new BroadcastChannel(`chat`);
  bc.postMessage("" + Date.now());
}
