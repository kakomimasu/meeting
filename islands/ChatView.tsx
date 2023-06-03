import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import axios from "axios-web";

export default function ChatView(
  props: { initialData: string[] },
) {
  const [data, setData] = useState<string[]>(props.initialData);

  useEffect(() => {
    let es = new EventSource(window.location.href);

    es.addEventListener("message", (e) => {
      const newData: string[] = JSON.parse(e.data);
      setData(newData);
    });

    es.addEventListener("error", async () => {
      es.close();
      const backoff = 10000 + Math.random() * 5000;
      await new Promise((resolve) => setTimeout(resolve, backoff));
      es = new EventSource(window.location.href);
    });
  }, []);

  const postMessageInput = useRef<HTMLInputElement>(null);
  const postMessage = useCallback(async () => {
    const value = postMessageInput.current!.value;
    if (!value) return;
    await axios.post("/", { data: value });
    postMessageInput.current!.value = "";
  }, []);

  return (
    <>
      <div class="border">
        {data.map((msg) => <div>{msg}</div>)}
      </div>
      <input ref={postMessageInput} class="border" />
      <Button onClick={postMessage}>送信</Button>
    </>
  );
}
