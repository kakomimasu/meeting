const kv = await Deno.openKv();

export function keyList(paramPrefix) {
  return kv.list({ prefix: [paramPrefix] });
}

export async function loadMessages() {
  const data = (await kv.get(["chat"])).value;
  if (!data) return [];
  return data;
}

export async function writeMessage(msg) {
  const messages = await loadMessages();
  messages.push(msg);
  await kv.set(["chat"], messages);
}

export async function write(key, value) {
  await kv.set(key, value);
}

export async function getAndDeleteOauthSession(session) {
  const res = await kv.get(["oauth_sessions", session]);
  if (res.versionstamp === null) return null;
  await kv.delete(["oauth_sessions", session]);
  return res.value;
}

export async function setUserWithSession(user, session) {
  await kv
    .atomic()
    .set(["users", user.id], user)
    .set(["users_by_login", user.login], user)
    .set(["users_by_session", session], user)
    .set(["users_by_last_signin", new Date().toISOString(), user.id], user)
    .commit();
}

export async function setOauthSession(session, value) {
  await kv.set(["oauth_sessions", session], value);
}

export async function deleteSession(session) {
  await kv.delete(["users_by_session", session]);
}
export async function getUserBySession(session) {
  if (!session) {
    return;
  }
  const res = await kv.get(["users_by_session", session]);
  return res.value;
}
