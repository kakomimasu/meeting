import { signIn } from "@/utils/github.ts";
import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(req) {
    return await signIn(req);
  },
};
