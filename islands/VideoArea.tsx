import { asset, Head } from "$fresh/runtime.ts";

export default function VideoArea() {
  return (
    <>
      <Head>
        <script src="https://cdn.jsdelivr.net/npm/@skyway-sdk/room/dist/skyway_room-latest.js" />
        <script type="module" src={asset("voice.js")} />
      </Head>

      <div class="video">
        <p>
          ID: <span id="my-id"></span>
        </p>
        <div>
          <button id="join">join</button>
          <button id="leave">leave</button>
        </div>
        <video id="local-video" width="400px" muted playsInline>
        </video>
        {/*<div id="button-area"></div>*/}
        <div id="remote-media-area"></div>
      </div>
    </>
  );
}
