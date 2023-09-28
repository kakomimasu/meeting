import { setUserWithSession } from "@/utils/database.ts";
import {
  getAuthenticatedUser,
  getMember,
  handleCallback,
} from "@/utils/github.ts";
import { Handlers } from "$fresh/server.ts";
import { State } from "@/utils/types.ts";

export const handler: Handlers<null, State> = {
  async GET(req) {
    const { response, sessionId } = await handleCallback(req);
    const ghUser = await getAuthenticatedUser(sessionId);

    const loginNameList = await getMember("kakomimasu");
    if (
      !loginNameList.includes(ghUser.login)
    ) {
      return new Response("ログイン可能なメンバーではありません", {
        status: 400,
      });
    }

    await setUserWithSession({
      id: String(ghUser.id),
      login: ghUser.login,
      name: ghUser.name,
      avatarUrl: ghUser.avatar_url,
    }, sessionId);

    return response;
  },
};
