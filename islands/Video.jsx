import { asset, Head } from "$fresh/runtime.ts";

export default function Video() {
  return (
    <>
      <Head>
        <script src="https://cdn.jsdelivr.net/npm/@skyway-sdk/room/dist/skyway_room-latest.js" />
        <script type="module" src={asset("voice.js")} />
      </Head>

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
    </>
  );
}
