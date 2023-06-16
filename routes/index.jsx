import { Head } from "$fresh/runtime.ts";

export function handler(_req, ctx) {
  const user = ctx.state.user;
  return ctx.render({ user });
}

export default function Index(props) {
  const user = props.data.user;
  return (
    <>
      <Head>
        <link rel="stylesheet" href="style.css" />
        <meta charset="utf-8" />
        <script src="https://cdn.jsdelivr.net/npm/@skyway-sdk/room/dist/skyway_room-latest.js" />
        <script type="module" src="chat.js" />
        <script type="module" src="voice.js" />
      </Head>
      <h1>Kakomimasu Meeting</h1>

      <div>
        <img src={user ? user.avatarUrl : ""} width={32} />
        <span>{user ? user.name : "ゲスト"}</span>
        <a href="/auth/signin" style={{ display: user ? "none" : "inline" }}>
          ログイン
        </a>
        <a href="/auth/signout" style={{ display: user ? "inline" : "none" }}>
          ログアウト
        </a>
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
