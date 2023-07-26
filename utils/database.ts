import { OauthSession } from "@/utils/github.ts";
import { Comment, User } from "@/utils/types.ts";

export const kv = await Deno.openKv();

export function keyList<T>(paramPrefix: string) {
  return kv.list<T>({ prefix: [paramPrefix] });
}

export async function getComment(commentId: string) {
  if (!commentId) {
    return null;
  }
  const res = await kv.get<Comment>(["comments", commentId]);
  return res.value;
}

export async function loadMessages() {
  const a = await kv.get(["chat"]);
  const data = a.value;
  if (!data) return [];
  return data;
}

export async function writeMessage(msg: string) {
  const messages = await loadMessages();
  messages.push(msg);
  await kv.set(["chat"], messages);
}

export async function write(key: any[], value: any) {
  await kv.set(key, value);
}

export async function getAndDeleteOauthSession(session: string) {
  const res = await kv.get(["oauth_sessions", session]);
  if (res.versionstamp === null) return null;
  await kv.delete(["oauth_sessions", session]);
  return res.value as OauthSession;
}

export async function setUserWithSession(user: User, session: string) {
  await kv
    .atomic()
    .set(["users", user.id], user)
    .set(["users_by_login", user.login], user)
    .set(["users_by_session", session], user)
    .set(["users_by_last_signin", new Date().toISOString(), user.id], user)
    .commit();
}

export async function setOauthSession(session: string, value: OauthSession) {
  await kv.set(["oauth_sessions", session], value);
}

export async function deleteSession(session: string) {
  await kv.delete(["users_by_session", session]);
}

export async function getUserBySession(session: string) {
  if (!session) {
    return null;
  }
  const res = await kv.get<User>(["users_by_session", session]);
  return res.value;
}
