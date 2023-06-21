import { useEffect, useRef, useState } from "preact/hooks";
import { asset, Head } from "$fresh/runtime.ts";
import { ROOM_NAME } from "@/utils/skyway.ts";
import type {
  RoomPublication,
  RemoteVideoStream,
  RemoteAudioStream,
  RemoteDataStream,
  LocalAudioStream,
  LocalVideoStream,
} from "https://esm.sh/@skyway-sdk/room@1.2.4?target=es2020";

// import {} from "https://cdn.jsdelivr.net/npm/@skyway-sdk/room/dist/skyway_room-latest.js";

// import {
//   SkyWayContext,
//   SkyWayRoom,
//   SkyWayStreamFactory,
//   LocalAudioStream,
//   LocalVideoStream,
// } from "https://esm.sh/@skyway-sdk/room@1.2.4?target=es2020";

// const { SkyWayContext, SkyWayRoom, SkyWayStreamFactory } = skyway_room;

// const localVideo = document.getElementById("local-video");
// const remoteMediaArea = document.getElementById("remote-media-area");
// const myId = document.getElementById("my-id");
// const joinButton = document.getElementById("join");
// const leaveButton = document.getElementById("leave");

// // const token = await getToken();

// let audioStream = null;
// let videoStream = null;

export default function VideoArea({ token }: { token: string }) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [streams, setStreams] = useState<{
    audioStream?: LocalAudioStream;
    videoStream?: LocalVideoStream;
  }>({});
  const [myId, setMyId] = useState("");

  async function initStream() {
    // 1
    // 自分のカメラと音声を取得 & videoタグにattach
    let audioStream;
    let videoStream;
    const { SkyWayStreamFactory } = await import(
      "https://esm.sh/@skyway-sdk/room@1.2.4?target=es2020"
    );
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

    setStreams({ audioStream, videoStream });

    // joinButton.addEventListener("click", joinRoom);
  }

  async function joinRoom() {
    console.log("joinRoom");
    const {
      SkyWayContext,
      SkyWayRoom,
      // RemoteVideoStream,
      // RemoteAudioStream,
      // RemoteDataStream,
    } = await import("https://esm.sh/@skyway-sdk/room@1.2.4?target=esnext");
    // room入室
    const context = await SkyWayContext.Create(token);
    console.log("context", context);
    // const room = await SkyWayRoom.FindOrCreate(context, {
    //   type: "p2p",
    //   name: ROOM_NAME,
    // });
    // const me = await room.join();
    // console.log("id", me.id);
    // setMyId(me.id);

    // myId.textContent = me.id;
    // if (streams.audioStream) await me.publish(streams.audioStream);
    // if (streams.videoStream) await me.publish(streams.videoStream);

    // const subscribeAndAttach = async (publication:RoomPublication) => {
    //   // 3
    //   if (publication.publisher.id === me.id) return;

    //   // const subscribeButton = document.createElement("button"); // 3-1
    //   // subscribeButton.textContent =
    //   //   `${publication.publisher.id}: ${publication.contentType}`;

    //   // buttonArea.appendChild(subscribeButton);
    //   // subscribeButton.onclick = async () => {
    //   //   // 3-2
    //   // };
    //   const { stream } = await me.subscribe(publication.id); // 3-2-1

    //   let newMedia; // 3-2-2
    //   if (stream instanceof RemoteVideoStream) {
    //     newMedia = document.createElement("video");
    //     newMedia.playsInline = true;
    //     newMedia.autoplay = true;
    //     stream.attach(newMedia);
    //   } else if (stream instanceof RemoteAudioStream) {
    //     newMedia = document.createElement("audio");
    //     newMedia.controls = false;
    //     newMedia.autoplay = true;
    //     stream.attach(newMedia);
    //   }

    //   // switch (stream.track.kind) {
    //   //   case "video":
    //   //     newMedia = document.createElement("video");
    //   //     newMedia.playsInline = true;
    //   //     newMedia.autoplay = true;
    //   //     break;
    //   //   case "audio":
    //   //     newMedia = document.createElement("audio");
    //   //     newMedia.controls = false;
    //   //     newMedia.autoplay = true;
    //   //     break;
    //   //   default:
    //   //     return;
    //   // }
    //   stream.attach(newMedia); // 3-2-3
    //   remoteMediaArea.appendChild(newMedia);

    //   leaveButton.addEventListener("click", () => {
    //     me.leave();
    //     remoteMediaArea.innerHTML = "";
    //     // room.dispose();
    //   });
    // };

    // room.publications.forEach(subscribeAndAttach); // 1

    // room.onStreamPublished.add((e) => {
    //   // 2
    //   subscribeAndAttach(e.publication);
    // });
  }

  useEffect(() => {
    initStream();
  }, [localVideoRef]);

  useEffect(() => {
    if (localVideoRef.current && streams.videoStream) {
      streams.videoStream.attach(localVideoRef.current);
      localVideoRef.current.play();
    }
  }, [localVideoRef, streams.videoStream]);
  return (
    <>
      <Head>
        {/* <script src="https://cdn.jsdelivr.net/npm/@skyway-sdk/room/dist/skyway_room-latest.js" />
        <script type="module" src={asset("voice.js")} /> */}
      </Head>

      <div class="video">
        <p>
          ID: <span id="my-id"></span>
        </p>
        <div>
          <button
            id="join"
            onClick={() => {
              joinRoom();
            }}
          >
            join
          </button>
          <button id="leave">leave</button>
        </div>
        <video
          id="local-video"
          ref={localVideoRef}
          width="400px"
          muted
          playsInline
        ></video>
        {/*<div id="button-area"></div>*/}
        <div id="remote-media-area"></div>
      </div>
    </>
  );
}
