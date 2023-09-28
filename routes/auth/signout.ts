import { Handlers } from "$fresh/server.ts";
import { signOut } from "@/utils/github.ts";

export const handler: Handlers = {
  async GET(req) {
    return await signOut(req);
  },
};
