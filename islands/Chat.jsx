import { useEffect, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";

export default function Chat({ user }) {
  const data = useSignal([]);
  const input = useRef();

  useEffect(() => {
    (async () => {
      if (!user) {
        return;
      }

      data.value = await (await fetch("/chat")).json();

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
    })();
  }, []);

  const send = async () => {
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
