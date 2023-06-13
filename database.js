export class Database {
  constructor({ kv }) {
    this.kv = kv;
  }

  async keyList(paramPrefix) {
    return await this.kv.list({ prefix: [paramPrefix] });
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
  async write(key, value) {
    await this.kv.set(key, value);
  }
  async getAndDeleteOauthSession(session) {
    const res = await this.kv.get(["oauth_sessions", session]);
    if (res.versionstamp === null) return null;
    await this.kv.delete(["oauth_sessions", session]);
    return res.value;
  }
  async setUserWithSession(user, session) {
    await this.kv
      .atomic()
      .set(["users", user.id], user)
      .set(["users_by_login", user.login], user)
      .set(["users_by_session", session], user)
      .set(["users_by_last_signin", new Date().toISOString(), user.id], user)
      .commit();
  }
  async setOauthSession(session, value) {
    await this.kv.set(["oauth_sessions", session], value);
  }
  async deleteSession(session) {
    await this.kv.delete(["users_by_session", session]);
  }
  async getUserBySession(session) {
    if (!session) {
      return;
    }
    const res = await this.kv.get(["users_by_session", session]);
    return res.value;
  }
}
