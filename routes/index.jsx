import { Head } from "$fresh/runtime.ts";

export default function Index() {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="style.css" />
        <meta charset="utf-8" />
        <script src="https://cdn.jsdelivr.net/npm/@skyway-sdk/room/dist/skyway_room-latest.js" />
        <script type="module" src="front.js" />
        <script type="module" src="voice.js" />
      </Head>
      <h1>Kakomimasu Meeting</h1>

      <div>
        <img id="user-icon" width="32" />
        <span id="user-name"></span>
        <a id="signin" href="/auth/signin">ログイン</a>
        <a id="signout" href="/auth/signout">ログアウト</a>
      </div>

      <div class="main">
        <div class="video">
          <p>
            ID: <span id="my-id"></span>
          </p>
          <div>
            <button id="join">join</button>
            <button id="leave">leave</button>
          </div>
          <video id="local-video" width="400px" muted playsinline></video>
          {/*<div id="button-area"></div>*/}
          <div id="remote-media-area"></div>
        </div>

        <div class="chat">
          <div class="message-div">
            <table id="messages"></table>
          </div>
          <div>
            <input id="input-msg" />
            <button id="send">送信</button>
          </div>
        </div>
      </div>
    </>
  );
}
