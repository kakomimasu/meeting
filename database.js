class Database {
  async connect() {
    this.kv = await Deno.openKv();
  }
  async loadMessages() {
    const data = (await this.kv.get(["chat"])).value;
    if (!data) return [];
    return data;
  }
  async writeMessage(msg) {
    const messages = await this.loadMessages();
    messages.push(msg);
    await this.kv.set(["chat"], messages);
  }
}

const db = new Database();
await db.connect();
export { db };
