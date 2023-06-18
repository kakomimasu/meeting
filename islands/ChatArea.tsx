import { useEffect, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { User } from "@/utils/database.ts";

export default function ChatArea({ user }: { user: User }) {
  const data = useSignal<string[]>([]);
  const input = useRef<HTMLInputElement>(null);

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
    if (!input.current) {
      return;
    }
    const form = new FormData();
    form.append("msg", input.current.value);
    await fetch("chat", {
      method: "POST",
      body: form,
    });
    input.current.value = "";
  };

  return (
    <>
      <div class="chat">
        <div class="chat-scroll">
          <table>
            {data.value.reverse().map((d) => (
              <tr>
                <td>{d}</td>
              </tr>
            ))}
          </table>
        </div>
        <div>
          <input ref={input} class="msg-input" />
          <button onClick={send} class="msg-send">送信</button>
        </div>
      </div>
    </>
  );
}
