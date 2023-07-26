const { SkyWayContext, SkyWayRoom, SkyWayStreamFactory } = skyway_room;

const MIC_ON_ICON = "/img/microphone.svg";
const MIC_OFF_ICON = "/img/microphone-off.svg";
const CAMERA_ON_ICON = "/img/device-computer-camera.svg";
const CAMERA_OFF_ICON = "/img/device-computer-camera-off.svg";

const remoteMediaArea = document.getElementById("remote-media-area");
const myId = document.getElementById("my-id");
const joinLeaveButton = document.getElementById("join-leave");

// Token & Room nameを取得
const res = await fetch("/skyway/token");
if (!res.ok) throw new Error("Failed to fetch skyway token");
const { token, roomName } = await res.json();

let audioStream = null;
let videoStream = null;
let r = null;

async function initStream() {
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
}

function createMediaElement(type) {
  const div = document.createElement("div");
  const newMedia = document.createElement(type); // 3-2-2
  newMedia.autoplay = true;
  switch (type) {
    case "video":
      newMedia.playsInline = true;
      break;
    case "audio":
      newMedia.controls = false;
      div.style.display = "none";
      break;
    default:
      return;
  }
  div.appendChild(newMedia);
  remoteMediaArea.appendChild(div);
  return { div: div, media: newMedia };
}

async function joinRoom() {
  // room入室
  const context = await SkyWayContext.Create(token);
  const room = await SkyWayRoom.FindOrCreate(context, {
    type: "p2p",
    name: roomName,
  });
  console.log(room);
  const me = await room.join();

  console.log(me.id);
  if (audioStream) {
    await me.publish(audioStream);
    console.log("published audio");
  }
  if (videoStream) {
    await me.publish(videoStream);
    const { div, media } = createMediaElement(videoStream.track.kind);

    // マイクアイコンの作成
    const micIcon = document.createElement("img");
    micIcon.className = "svg-icon mic";
    micIcon.src = MIC_ON_ICON;
    micIcon.width = 24;
    micIcon.addEventListener("click", toggleMic(micIcon));
    div.appendChild(micIcon);

    // カメラアイコンの作成
    const cameraIcon = document.createElement("img");
    cameraIcon.className = "svg-icon camera";
    cameraIcon.src = CAMERA_ON_ICON;
    cameraIcon.width = 24;
    cameraIcon.addEventListener("click", toggleCamera(cameraIcon));
    div.appendChild(cameraIcon);

    videoStream.attach(media);
    console.log("published video");
  }

  const subscribeAndAttach = async (publication) => {
    // 3
    if (publication.publisher.id === me.id) return;

    const { stream } = await me.subscribe(publication.id); // 3-2-1
    // console.log("publication", stream.track.kind, publication.id);

    const { media: newMedia, div } = createMediaElement(stream.track.kind);
    div.id = publication.id;
    stream.attach(newMedia);
  };

  room.publications.forEach(subscribeAndAttach); // 1

  room.onStreamPublished.add((e) => {
    // 2
    subscribeAndAttach(e.publication);
  });
  room.onStreamUnpublished.add((e) => {
    // StreamがUnpublishされたらそのIDの要素を削除

    console.log("unpublished", e.publication.contentType, e.publication.id, e);
    document.getElementById(e.publication.id).remove();
  });
  return { room, me };
}

async function leaveRoom({ room, me }) {
  remoteMediaArea.innerHTML = "";
  // console.log(me);

  // 自分がpublishしたstreamをunpublish
  for await (const stream of me.publications) {
    console.log(stream.id, stream.contentType);
    await me.unpublish(stream.id);
  }

  // roomからleave
  room.dispose();
  console.log("room disposed");
}

async function joinOrLeave() {
  if (r) {
    await leaveRoom(r);
    r = null;
    myId.textContent = "";
    joinLeaveButton.textContent = "Join";
  } else {
    r = await joinRoom();
    // console.log(r);
    myId.textContent = r.me.id;
    joinLeaveButton.textContent = "Leave";
  }
}

function toggleCamera(cameraIcon) {
  return () => {
    if (r) {
      const video = r.me.publications.find((p) => p.contentType === "video");
      if (video.state === "enabled") {
        video.disable();
        cameraIcon.src = CAMERA_OFF_ICON;
      } else {
        video.enable();
        cameraIcon.src = CAMERA_ON_ICON;
      }
    }
  };
}

function toggleMic(micIcon) {
  return () => {
    if (r) {
      const audio = r.me.publications.find((p) => p.contentType === "audio");
      if (audio.state === "enabled") {
        audio.disable();
        micIcon.src = MIC_OFF_ICON;
      } else {
        audio.enable();
        micIcon.src = MIC_ON_ICON;
      }
    }
  };
}

joinLeaveButton.addEventListener("click", joinOrLeave);

(async () => {
  await initStream();
  joinOrLeave();
})();
