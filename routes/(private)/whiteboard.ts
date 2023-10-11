import { Handlers } from "$fresh/server.ts";
import { State } from "@/utils/types.ts";
import { loadWhiteBoard, saveWhiteBoard } from "@/utils/database.ts";

type KkmmHandlers<T> = Handlers<T, State>;

const allSockets = {} as Record<string, WebSocket>;
const channel = new BroadcastChannel("earth");

function broadcast(content: string) {
  for (const id in allSockets) {
    const otherSocket = allSockets[id];
    otherSocket.send(content);
  }
}

channel.onmessage = (e: MessageEvent) => {
  broadcast(e.data);
};

export const handler: KkmmHandlers<null> = {
  GET(req, _ctx) {
    const { response, socket } = Deno.upgradeWebSocket(req);
    const id = crypto.randomUUID();

    socket.onopen = async (e: Event) => {
      allSockets[id] = e.currentTarget as WebSocket;
      const content = await loadWhiteBoard();
      socket.send(content);
    };

    socket.onmessage = async (e: MessageEvent) => {
      await saveWhiteBoard(e.data);
      const content = await loadWhiteBoard();
      broadcast(content);
      channel.postMessage(content);
    };

    socket.onclose = () => {
      delete allSockets[id];
    };

    return response;
  },
};
