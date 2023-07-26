import { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import { getNewToken, ROOM_NAME } from "@/utils/skyway.ts";

export const handler: Handlers<null, State> = {
  GET(_req, _ctx) {
    const token = getNewToken();
    return Response.json({ token, roomName: ROOM_NAME });
  },
};
