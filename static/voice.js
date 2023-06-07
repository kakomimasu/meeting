/// <reference lib="dom"/>

const {
  nowInSec,
  SkyWayAuthToken,
  SkyWayContext,
  SkyWayRoom,
  SkyWayStreamFactory,
  uuidV4,
} = skyway_room;

const APP_ID = "";
const SECRET_KEY = "";
const ROOM_NAME = "kakomimasu-meeting";

const localVideo = document.getElementById("local-video");
const buttonArea = document.getElementById("button-area");
const remoteMediaArea = document.getElementById("remote-media-area");
const myId = document.getElementById("my-id");
const joinButton = document.getElementById("join");

async function joinRoom() {
  // room入室
  const context = await SkyWayContext.Create(token);
  const room = await SkyWayRoom.FindOrCreate(context, {
    type: "p2p",
    name: ROOM_NAME,
  });
  const me = await room.join();

  myId.textContent = me.id;
  // await me.publish(audio);
  // await me.publish(video);

  const subscribeAndAttach = (publication) => {
    // 3
    if (publication.publisher.id === me.id) return;

    const subscribeButton = document.createElement("button"); // 3-1
    subscribeButton.textContent =
      `${publication.publisher.id}: ${publication.contentType}`;

    buttonArea.appendChild(subscribeButton);

    subscribeButton.onclick = async () => {
      // 3-2
      const { stream } = await me.subscribe(publication.id); // 3-2-1

      let newMedia; // 3-2-2
      switch (stream.track.kind) {
        case "video":
          newMedia = document.createElement("video");
          newMedia.playsInline = true;
          newMedia.autoplay = true;
          break;
        case "audio":
          newMedia = document.createElement("audio");
          newMedia.controls = true;
          newMedia.autoplay = true;
          break;
        default:
          return;
      }
      stream.attach(newMedia); // 3-2-3
      remoteMediaArea.appendChild(newMedia);
    };
  };

  room.publications.forEach(subscribeAndAttach); // 1

  room.onStreamPublished.add((e) => {
    // 2
    subscribeAndAttach(e.publication);
  });
}

const token = new SkyWayAuthToken({
  jti: uuidV4(),
  iat: nowInSec(),
  exp: nowInSec() + 60 * 60 * 24,
  scope: {
    app: {
      id: APP_ID,
      turn: true,
      actions: ["read"],
      channels: [
        {
          id: "*",
          name: "*",
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

(async () => {
  // 1
  // 自分のカメラと音声を取得 & videoタグにattach
  const { audio, video } = await SkyWayStreamFactory
    .createMicrophoneAudioAndCameraStream();
  video.attach(localVideo);
  await localVideo.play();

  joinButton.addEventListener("click", joinRoom);
})(); // 1

// カメラ映像取得
// navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//   .then((stream) => {
//     // 成功時にvideo要素にカメラ映像をセットし、再生
//     const videoElm = document.getElementById("my-video");
//     videoElm.srcObject = stream;
//     videoElm.play();
//     // 着信時に相手にカメラ映像を返せるように、グローバル変数に保存しておく
//     localStream = stream;
//   }).catch((error) => {
//     // 失敗時にはエラーログを出力
//     console.error("mediaDevice.getUserMedia() error:", error);
//     return;
//   });
