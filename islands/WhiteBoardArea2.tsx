import { useEffect, useRef, useState } from "preact/hooks";
import { useSignal } from "@preact/signals";

export default function WhiteBoardArea2() {
  const ws = useRef<WebSocket>();
  const data = useSignal<string>("");

  useEffect(() => {
    const SCHEME = new Map();
    SCHEME.set("http:", "ws:");
    SCHEME.set("https:", "wss:");
    const sc = SCHEME.get(location.protocol);
    ws.current = new WebSocket(sc + "//" + location.host + "/whiteboard");
    ws.current.onmessage = (e) => {
      const content = e.data;
      data.value = content;
    };
    return () => ws.current?.close();
  });

  const input = (content: string) => {
    if (!ws.current) {
      return;
    }
    ws.current.send(content);
  };

  return (
    <div class="whiteboard">
      <textarea
        onInput={(e) => {
          input(e.currentTarget.value);
          e.stopPropagation();
        }}
      >
        {data}
      </textarea>
    </div>
  );
}
