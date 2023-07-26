import { asset, Head } from "$fresh/runtime.ts";

export default function VideoArea() {
  return (
    <>
      <Head>
        <script src="https://cdn.jsdelivr.net/npm/@skyway-sdk/room/dist/skyway_room-latest.js" />
        <script type="module" src={asset("voice.js")} />
      </Head>

      <div class="video">
        <div
          id="remote-media-area"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5em",
            justifyContent: "center",
          }}
        ></div>
        <div style={{ flexGrow: 1 }} />
        <div>
          <button id="join-leave">Join</button>
          <span id="my-id" style={{ fontSize: "10px" }}></span>
        </div>
      </div>
    </>
  );
}
