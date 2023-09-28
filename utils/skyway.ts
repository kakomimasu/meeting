import { SkyWayAuthToken } from "skyway-token";

const APP_ID = Deno.env.get("SKYWAY_ID") as string;
const SECRET_KEY = Deno.env.get("SKYWAY_SECRET") as string;
const ROOM_NAME = Deno.env.get("SKYWAY_ROOM") ?? "kakomimasu-meeting-local";

// export const ROOM_NAME = "kakomimasu-meeting";

export function getNewToken() {
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
            name: ROOM_NAME,
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
