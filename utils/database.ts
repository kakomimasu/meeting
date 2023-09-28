import { OauthSession } from "@/utils/github.ts";
import { Comment, User } from "@/utils/types.ts";
import { get, set } from "kv_toolbox/blob.ts";

const kv = await Deno.openKv();

const KV_KEY_PREFIX_COMMENT = "comments";
const KV_KEY_PREFIX_USER_SESSION = "users_by_session";
const KV_KEY_PREFIX_OAUTH_SESSION = "oauth_sessions";

export function keyListComment() {
  return kv.list<Comment>({ prefix: [KV_KEY_PREFIX_COMMENT] });
}

export function keyList<T>(paramPrefix: string) {
  return kv.list<T>({ prefix: [paramPrefix] });
}

export async function getComment(commentId: string) {
  if (!commentId) {
    return null;
  }
  const res = await kv.get<Comment>([KV_KEY_PREFIX_COMMENT, commentId]);
  return res.value;
}

export async function writeComment(comment: Comment) {
  await kv.set([KV_KEY_PREFIX_COMMENT, comment.id], comment);
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
    .set([KV_KEY_PREFIX_USER_SESSION, session], user)
    .set(["users_by_last_signin", new Date().toISOString(), user.id], user)
    .commit();
}

export async function setOauthSession(session: string, value: OauthSession) {
  await kv.set([KV_KEY_PREFIX_OAUTH_SESSION, session], value);
}

export async function deleteSession(session: string) {
  await kv.delete([KV_KEY_PREFIX_USER_SESSION, session]);
}

export async function getUserBySession(session: string) {
  if (!session) {
    return null;
  }
  const res = await kv.get<User>([KV_KEY_PREFIX_USER_SESSION, session]);
  return res.value;
}

export async function saveFile(
  fileId: string,
  stream: ReadableStream<Uint8Array>,
  ctype: string | undefined,
  comment: Comment,
) {
  await set(kv, ["files", fileId, "blob"], stream);
  await kv.set(["files", fileId, "contentType"], ctype);
  await kv.set(["comments", comment.id], comment);
}

export async function loadFile(fileId: string) {
  const body = await get(kv, ["files", fileId, "blob"]);
  const contentType =
    (await kv.get<string>(["files", fileId, "contentType"])).value;
  return { body, contentType };
}
