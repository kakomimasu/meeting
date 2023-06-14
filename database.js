const kv = await Deno.openKv();

export const keyList = (paramPrefix) => {
  return kv.list({ prefix: [paramPrefix] });
};

export const loadMessages = async () => {
  const a = await kv.get(["chat"]);
  console.log(a);
  const data = a.value;
  if (!data) return [];
  return data;
};

export const writeMessage = async (msg) => {
  const messages = await loadMessages();
  messages.push(msg);
  await kv.set(["chat"], messages);
};

export const write = async (key, value) => {
  await kv.set([key], value);
};

export const getAndDeleteOauthSession = async (session) => {
  const res = await kv.get(["oauth_sessions", session]);
  if (res.versionstamp === null) return null;
  await kv.delete(["oauth_sessions", session]);
  return res.value;
};

export const setUserWithSession = async (user, session) => {
  await kv
    .atomic()
    .set(["users", user.id], user)
    .set(["users_by_login", user.login], user)
    .set(["users_by_session", session], user)
    .set(["users_by_last_signin", new Date().toISOString(), user.id], user)
    .commit();
};

export const setOauthSession = async (session, value) => {
  await kv.set(["oauth_sessions", session], value);
};

export const deleteSession = async (session) => {
  await kv.delete(["users_by_session", session]);
};

export const getUserBySession = async (session) => {
  if (!session) {
    return;
  }
  const res = await kv.get(["users_by_session", session]);
  return res.value;
};
