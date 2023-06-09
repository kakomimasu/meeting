export class Chat {
  constructor(db) {
    this.db = db;
  }
  connect() {
    const bc = new BroadcastChannel(`chat`);
    const db = this.db;
    const body = new ReadableStream({
      start(controller) {
        bc.addEventListener("message", async () => {
          try {
            const data = await db.loadMessages();
            const chunk = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(new TextEncoder().encode(chunk));
          } catch (e) {
            console.error(`Error refreshing chat`, e);
          }
        });
        console.log("Opened stream");
      },
      cancel() {
        bc.close();
        console.log("Closed stream");
      },
    });
    return body;
  }
  async post(msg) {
    await this.db.writeMessage(msg);
    const bc = new BroadcastChannel(`chat`);
    bc.postMessage("" + Date.now());
  }
  async load() {
    return await this.db.loadMessages();
  }
}
