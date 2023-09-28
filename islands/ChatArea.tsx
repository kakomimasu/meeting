import { useEffect, useRef, useState } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { User, Comment } from "@/utils/types.ts";
import { ChangeEvent } from "preact/compat";

export default function ChatArea({ user }: { user: User }) {
  const [data, setData] = useState<Comment[]>([]);
  const input = useRef<HTMLTextAreaElement>(null);
  const commentIdElement = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // コメントが更新されたら一番下までスクロール
  useEffect(() => {
    if (chatRef.current) {
      const scrollHeight = chatRef.current.scrollHeight;
      chatRef.current.scrollTop = scrollHeight - chatRef.current.clientHeight;
    }
  }, [data]);

  useEffect(() => {
    if (!user) {
      return;
    }

    (async () => {
      setData(await (await fetch("/chat")).json());
    })();

    let es = new EventSource(window.location.href + "chat");
    es.addEventListener("message", (e) => {
      setData(JSON.parse(e.data));
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

  const replaceBr = (text: string) => {
    return text.split("\n").map((a) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = a.split(urlRegex);
      return (
        <>
          {parts.map((part, index) => {
            if (part.match(urlRegex)) {
              return (
                <a
                  key={index}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {part}
                </a>
              );
            }
            return part;
          })}
          <br />
        </>
      );
    });
  };

  const modifyComment = (comment: Comment) => {
    if (!input.current || !commentIdElement.current) {
      return;
    }
    input.current.value = comment.message;
    commentIdElement.current.value = comment.id;
  };

  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target) {
      return;
    }
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("filename", e.target.files[0].name);
    await fetch("/upload", {
      method: "POST",
      body: formData,
    });
  };

  const ChatEdit = ({ comment }: { comment: Comment }) => {
    return (
      <div class="chat-edit">
        {user.id == comment.user.id ? (
          <a href="#" onClick={() => modifyComment(comment)}>
            🖊️
          </a>
        ) : (
          <></>
        )}
      </div>
    );
  };

  const FileView = ({ comment }: { comment: Comment }) => (
    <div>
      {replaceBr(comment.message)}{" "}
      {comment.fileId && comment.contentType?.startsWith("image/") ? (
        <img src={`/upload/files/${comment.fileId}`} width={64} />
      ) : (
        ""
      )}
      {comment.fileId && !comment.contentType?.startsWith("image/") ? (
        <a href={`/upload/files/${comment.fileId}`}>開く</a>
      ) : (
        ""
      )}
    </div>
  );

  return (
    <>
      <div class="chat">
        <div class="chat-scroll" ref={chatRef}>
          {data.map((d) => (
            <div class="chat-row">
              <div>
                <img src={d.user.avatarUrl} width="48" height="48" />
              </div>
              <div class="chat-right">
                <div class="chat-right-top">
                  <div>{d.user.name}</div>
                  <div class="chat-date">
                    {showDate(d.createdAt.toString())}
                  </div>
                  <ChatEdit comment={d} />
                </div>
                <FileView comment={d} />
              </div>
            </div>
          ))}
        </div>
        <div>
          <textarea ref={input} class="msg-input" onKeyDown={keyDown} />
          <input type="hidden" ref={commentIdElement} />
          <button onClick={send} class="msg-send">
            送信
          </button>
          <button onClick={reset}>リセット</button>
          <input type="file" onInput={upload} />
        </div>
      </div>
    </>
  );
}
