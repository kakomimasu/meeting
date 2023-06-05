export class Database {
  static async open() {
    const kv = await Deno.openKv();
    return new Database(kv);
  }
  constructor(kv) {
    this.kv = kv;
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
