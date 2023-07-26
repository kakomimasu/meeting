import { useEffect, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { User, Comment } from "@/utils/types.ts";

export default function ChatArea({ user }: { user: User }) {
  const data = useSignal<Comment[]>([]);
  const input = useRef<HTMLTextAreaElement>(null);
  const commentIdElement = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    (async () => {
      data.value = await (await fetch("/chat")).json();
    })();

    let es = new EventSource(window.location.href + "chat");
    es.addEventListener("message", (e) => {
      data.value = JSON.parse(e.data);
    });

    es.addEventListener("error", async () => {
      es.close();
      const backoff = 10000 + Math.random() * 5000;
      await new Promise((resolve) => setTimeout(resolve, backoff));
      es = new EventSource(window.location.href + "chat");
    });

    return () => es.close();
  }, []);

  const send = async () => {
    if (!input.current || !commentIdElement.current) {
      return;
    }
    const form = new FormData();
    form.append("msg", input.current.value);
    if (commentIdElement.current.value?.trim()) {
      form.append("comment-id", commentIdElement.current.value);
    }
    await fetch("chat", {
      method: "POST",
      body: form,
    });
    reset();
  };

  const reset = () => {
    if (!input.current || !commentIdElement.current) {
      return;
    }
    input.current.value = "";
    commentIdElement.current.value = "";
  };

  const showDate = (date: string) => {
    const dateStr = new Date(date).toLocaleString();
    return dateStr;
  };

  const keyDown = async (e: KeyboardEvent) => {
    if (input.current?.value != "" && e.shiftKey && e.key == "Enter") {
      await send();
    }
  };

  const replaceBr = (text: string) =>
    text.split("\n").map((a) => (
      <>
        {a}
        <br />
      </>
    ));

  const modifyComment = (comment: Comment) => {
    console.log("comment", comment);
    if (!input.current || !commentIdElement.current) {
      return;
    }
    input.current.value = comment.message;
    commentIdElement.current.value = comment.id;
  };

  const upload = async (e) => {
    console.log("upload file");
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    await fetch("/upload", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <>
      <div class="chat">
        <div class="chat-scroll">
          <table>
            {data.value.map((d) => (
              <tr>
                <td>
                  <img src={d.user.avatarUrl} />
                </td>
                <td>{d.user.name}</td>
                <td>
                  {replaceBr(d.message)}{" "}
                  {d.fileId ? (
                    <img src={`/upload/files/${d.fileId}`} width={64} />
                  ) : (
                    ""
                  )}
                  {user.id == d.user.id ? (
                    <button onClick={() => modifyComment(d)}>🖊️</button>
                  ) : (
                    ""
                  )}
                </td>
                <td>{showDate(d.createdAt)}</td>
              </tr>
            ))}
          </table>
        </div>
        <div>
          <textarea ref={input} class="msg-input" onKeyDown={keyDown} />
          <input type="hidden" ref={commentIdElement} />
          <button onClick={send} class="msg-send">
            送信
          </button>
          <button onClick={reset}>りせっと</button>
          <input type="file" onChange={upload} />
        </div>
      </div>
    </>
  );
}
