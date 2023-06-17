import { Head } from "$fresh/runtime.ts";
import User from "@/components/User.jsx";
import Chat from "@/islands/Chat.jsx";

export const handler = {
  GET(_req, ctx) {
    const user = ctx.state.user;
    return ctx.render({ user });
  },
};

export default function Page({ data }) {
  const { user } = data;
  return (
    <>
      <Head>
        <script src="https://cdn.jsdelivr.net/npm/@skyway-sdk/room/dist/skyway_room-latest.js" />
        <script type="module" src="voice.js" />
      </Head>

      <User user={user} />

      <div
        style={{ display: "flex", flexDirection: "row" }}
      >
        <div
          style={{ width: "50%" }}
        >
          <p>
            ID: <span id="my-id"></span>
          </p>
          <div>
            <button id="join">join</button>
            <button id="leave">leave</button>
          </div>
          <video
            id="local-video"
            width="400px"
            muted
            playsinline
            style={{ position: "absolute", width: "128px" }}
          >
          </video>
          {/*<div id="button-area"></div>*/}
          <div id="remote-media-area"></div>
        </div>

        <Chat user={user} />
      </div>
    </>
  );
}
