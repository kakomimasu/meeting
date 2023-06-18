import { Handlers } from "$fresh/server.ts";
import { SkyWayAuthToken } from "skyway-token";
import { State } from "@/routes/_middleware.ts";

const APP_ID = Deno.env.get("SKYWAY_ID");
const SECRET_KEY = Deno.env.get("SKYWAY_SECRET");

function getNewToken() {
  return new SkyWayAuthToken({
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 36000, // 10h=60*60*10
    jti: crypto.randomUUID(),
    scope: {
      app: {
        id: APP_ID,
        turn: true,
        actions: ["read"],
        channels: [
          {
            // id: "*",
            // name: "*",
            name: "kakomimasu-meeting",
            actions: ["write"],
            members: [
              {
                id: "*",
                name: "*",
                actions: ["write"],
                publication: {
                  actions: ["write"],
                },
                subscription: {
                  actions: ["write"],
                },
              },
            ],
            sfuBots: [
              {
                actions: ["write"],
                forwardings: [
                  {
                    actions: ["write"],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  }).encode(SECRET_KEY);
}

export const handler: Handlers<Response, State> = {
  GET(_req, _ctx) {
    const token = getNewToken();
    return Response.json({ token });
  },
};
