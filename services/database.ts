export const db = await Deno.openKv();

export async function loadMessages() {
  const data = (await db.get(["chat"])).value;
  if (!data) return [];
  return data;
}

export async function writeMessage(msg: string): Promise<void> {
  const messages = await loadMessages();
  messages.push(msg);
  await db.set(["chat"], messages);
}
