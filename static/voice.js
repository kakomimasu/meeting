const { SkyWayContext, SkyWayRoom, SkyWayStreamFactory } = skyway_room;

const ROOM_NAME = "kakomimasu-meeting";

async function getToken() {
  const res = await fetch("/skyway/token");
  if (!res.ok) throw new Error("Failed to fetch skyway token");
  const { token } = await res.json();
  return token;
}

const localVideo = document.getElementById("local-video");
const remoteMediaArea = document.getElementById("remote-media-area");
const myId = document.getElementById("my-id");
const joinButton = document.getElementById("join");
const leaveButton = document.getElementById("leave");

const token = await getToken();

let audioStream = null;
let videoStream = null;

async function joinRoom() {
  // room入室
  const context = await SkyWayContext.Create(token);
  const room = await SkyWayRoom.FindOrCreate(context, {
    type: "p2p",
    name: ROOM_NAME,
  });
  const me = await room.join();

  myId.textContent = me.id;
  if (audioStream) await me.publish(audioStream);
  if (videoStream) await me.publish(videoStream);

  const subscribeAndAttach = async (publication) => {
    // 3
    if (publication.publisher.id === me.id) return;

    // const subscribeButton = document.createElement("button"); // 3-1
    // subscribeButton.textContent =
    //   `${publication.publisher.id}: ${publication.contentType}`;

    // buttonArea.appendChild(subscribeButton);
    // subscribeButton.onclick = async () => {
    //   // 3-2
    // };
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
        newMedia.controls = false;
        newMedia.autoplay = true;
        break;
      default:
        return;
    }
    stream.attach(newMedia); // 3-2-3
    remoteMediaArea.appendChild(newMedia);

    leaveButton.addEventListener("click", () => {
      me.leave();
      remoteMediaArea.innerHTML = "";
      // room.dispose();
    });
  };

  room.publications.forEach(subscribeAndAttach); // 1

  room.onStreamPublished.add((e) => {
    // 2
    subscribeAndAttach(e.publication);
  });
}

(async () => {
  // 1
  // 自分のカメラと音声を取得 & videoタグにattach
  try {
    audioStream = await SkyWayStreamFactory.createMicrophoneAudioStream();
  } catch (_e) {
    console.error("マイクが取得できません。");
  }
  try {
    videoStream = await SkyWayStreamFactory.createCameraVideoStream();
  } catch (_e) {
    console.error("カメラが取得できません。");
  }

  if (videoStream) {
    videoStream.attach(localVideo);
    await localVideo.play();
  }

  joinButton.addEventListener("click", joinRoom);
})();
