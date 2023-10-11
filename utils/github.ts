import * as kv_oauth from "kv_oauth";
import { Octokit as OctokitRest } from "https://esm.sh/@octokit/rest@20.0.1";

interface GitHubUser {
  id: string;
  login: string;
  name: string;
  avatar_url: string;
}

const oauth2Client = kv_oauth.createGitHubOAuthConfig({
  scope: ["read:user"],
});

export const signIn = (req: Request) => kv_oauth.signIn(req, oauth2Client);
export const signOut = (req: Request) => kv_oauth.signOut(req);
export const handleCallback = (req: Request) =>
  kv_oauth.handleCallback(req, oauth2Client);
export const getSessionId = (req: Request) => kv_oauth.getSessionId(req);

/**
 * 指定したorganizationに属するpeopleを取得
 */
const octokitRest = new OctokitRest({
  auth: Deno.env.get("GITHUB_PERSONAL_SECRET"),
});

export async function getMember(organization: string) {
  const { data: users } = await octokitRest.orgs.listMembers({
    org: organization,
  });
  const loginNameList = (users as { login: string }[]).map((user) =>
    user.login
  );
  return loginNameList;
}

export interface OauthSession {
  state: string;
  codeVerifier: string;
}

export async function getAuthenticatedUser(
  accessToken: string,
) {
  const resp = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${accessToken}`,
    },
  });
  if (!resp.ok) {
    throw new Error("Failed to fetch user");
  }
  return await resp.json() as GitHubUser;
}
