import { useEffect, useMemo, useState } from "preact/hooks";
import { Head } from "$fresh/runtime.ts";
import * as SSR from "https://esm.sh/@skyway-sdk/room@1.5.1";

import { User } from "@/utils/types.ts";
import SvgIcon from "@/components/SvgIcon.tsx";

// Skyway-sdkを型補完のためグローバルに登録（sdk自体はscriptタグで読み込み）
declare global {
  interface Window {
    skyway_room: typeof SSR;
  }
}

type StreamData = {
  id: string;
  name: string;
  type: "audio" | "video";
  metadata: string;
  side: "remote" | "local";
  stream: SSR.RemoteStream | SSR.LocalStream;
  publication: SSR.RoomPublication;
  state: "enabled" | "disabled";
};

async function initStream() {
  const { SkyWayStreamFactory } = window.skyway_room;
  // 自分のカメラと音声を取得 & videoタグにattach
  let audioStream: SSR.LocalAudioStream | undefined = undefined;
  let videoStream: SSR.LocalVideoStream | undefined = undefined;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        noiseSuppression: false,
        echoCancellation: true,
        sampleRate: { ideal: 32000 },
        sampleSize: { ideal: 16 },
        // latency: 0.01,
      },
    });

    const audioContext = new AudioContext();
    const mic = audioContext.createMediaStreamSource(stream);
    const output = audioContext.createMediaStreamDestination();

    const noiseSuppressionFilter = audioContext.createBiquadFilter();
    noiseSuppressionFilter.type = "bandpass";
    noiseSuppressionFilter.frequency.value = 1000;

    mic.connect(noiseSuppressionFilter);
    noiseSuppressionFilter.connect(output);

    const audioSource = output.stream.getAudioTracks()[0];
    audioStream = new window.skyway_room.LocalAudioStream(audioSource);
  } catch (_e) {
    console.error("マイクが取得できません。");
  }
  try {
    videoStream = await SkyWayStreamFactory.createCameraVideoStream();
  } catch (_e) {
    console.error("カメラが取得できません。");
  }
  return { audioStream, videoStream };
}

export default function VideoArea({
  token,
  roomName,
  user,
}: {
  token: string;
  roomName: string;
  user: User;
}) {
  const [room, setRoom] = useState<{
    room: SSR.P2PRoom;
    me: SSR.LocalP2PRoomMember;
  }>();
  const [isEnableCamera, setIsEnableCamera] = useState(true);
  const [isEnableMic, setIsEnableMic] = useState(true);

  const [streams, setStreams] = useState<StreamData[]>([]);
  const [screenShareStream, setScreenShareStream] =
    useState<SSR.RoomPublication[]>();

  /** {userId}/{metadata} のKey形式 */
  const [selectedFullScreenMediaKey, setSelectedFullScreenMediaKey] =
    useState<string>();

  const mediaStreamsData = useMemo(() => {
    if (!room) return [];
    let keys = streams.map((stream) => {
      const key = `${stream.id}/${stream.metadata}/${stream.name}`;
      return key;
    });
    keys = Array.from(new Set(keys)); // 重複を削除

    return keys.map((key) => {
      const [id, metadata, name] = key.split("/");
      const tracks: MediaStreamTrack[] = [];

      /** Audioが無効な場合はTrue。Audioが有効または存在しない場合はFalse */
      let disableAudio = false;

      const videoStream = streams.find(
        (s) => s.id === id && s.metadata === metadata && s.type === "video"
      )?.stream as SSR.RemoteVideoStream | SSR.LocalVideoStream | undefined;
      if (videoStream) tracks.push(videoStream.track);

      const audioData = streams.find((s) => s.id === id && s.type === "audio");
      if (audioData) {
        const audioStream = audioData.stream as
          | SSR.RemoteAudioStream
          | SSR.LocalAudioStream;
        tracks.push(audioStream.track);
        disableAudio = audioData.state === "disabled";
      }

      const mediaStream = new MediaStream(tracks);

      // console.log(key, mediaStream, tracks);
      return {
        id,
        name,
        metadata: metadata,
        mediaStream: mediaStream,
        disableAudio,
      };
    });
  }, [streams]);

  function changeStreamState(
    stream: SSR.LocalStream | SSR.RemoteStream,
    state: "enabled" | "disabled"
  ) {
    setStreams((prev) => {
      return prev.map((p) => {
        if (p.stream.id === stream.id) {
          return { ...p, state };
        }
        return p;
      });
    });
  }

  async function joinRoom() {
    const { SkyWayContext, SkyWayRoom } = window.skyway_room;

    // Room取得
    const context = await SkyWayContext.Create(token);
    const room = await SkyWayRoom.FindOrCreate(context, {
      type: "p2p",
      name: roomName,
    });
    console.log(room);

    // RoomにJoin
    let me_: SSR.LocalP2PRoomMember | undefined = undefined;
    let joinRetryCount = 1;
    while (!me_) {
      try {
        const name =
          user.name + (joinRetryCount > 1 ? `${joinRetryCount}` : "");
        me_ = await room.join({ name });
      } catch (e) {
        joinRetryCount++;
        console.error(e);
      }
    }
    if (!me_) throw new Error("Failed to join room");
    const me = me_;
    setRoom({ room, me });
    console.log(me.id);

    // 自分がPublishした時の処理
    me.onStreamPublished.add((e) => {
      console.log(
        "Local Publish!",
        e.publication.contentType,
        e.publication.stream?.id
      );
      const publication = e.publication;
      const stream = publication.stream;

      // 自分のVideoだけ(Audioは無視)
      const state = publication.state;
      if (state === "canceled") return;
      if (!stream) return;
      if (stream.contentType !== "video") return;
      setStreams((prev) => [
        ...prev,
        {
          id: publication.publisher.id,
          name: publication.publisher.name ?? "",
          type: "video",
          metadata: publication.metadata ?? "",
          side: "local",
          stream,
          publication,
          state,
        },
      ]);

      publication.onEnabled.add(() => {
        changeStreamState(stream, "enabled");
      });
      publication.onDisabled.add(() => {
        changeStreamState(stream, "disabled");
      });
    });

    // 自分がUnpublishした時の処理
    me.onStreamUnpublished.add((e) => {
      console.log(
        "Local Unpublish!",
        e.publication.contentType,
        e.publication.stream?.id
      );
      setStreams((prev) =>
        prev.filter((p) => p.stream.id !== e.publication.stream?.id)
      );
    });

    // 他端末のStreamのSubscribe & Attach処理（自分のIDだった場合はスキップ）
    const subscribeAndAttach = async (
      publication: SSR.RoomPublication<SSR.LocalStream>
    ) => {
      if (publication.publisher.id === me.id) {
        console.log("skip my publication", publication);
        return;
      }
      const { stream } = await me.subscribe(publication.id); // 3-2-1
      if (stream.contentType === "data") return;
      console.log("Remote Publish!", stream.contentType, stream.id);

      const state = publication.state;
      if (state === "canceled") return;

      publication.onEnabled.add(() => {
        changeStreamState(stream, "enabled");
      });
      publication.onDisabled.add(() => {
        changeStreamState(stream, "disabled");
      });

      setStreams((prev) => [
        ...prev,
        {
          id: publication.publisher.id,
          name: publication.publisher.name ?? "",
          type: stream.contentType,
          metadata: publication.metadata ?? "",
          side: "remote",
          stream,
          publication,
          state,
        },
      ]);
    };

    room.publications.forEach(subscribeAndAttach);

    room.onStreamPublished.add((e) => {
      // console.log("published", e.publication);
      subscribeAndAttach(e.publication);
    });
    room.onStreamUnpublished.add((e) => {
      // StreamがUnpublishされたらそのIDの要素を削除
      setStreams((prev) =>
        prev.filter((p) => p.publication.id !== e.publication.id)
      );
      console.log(
        "Remote Unpublish!",
        e.publication.contentType,
        e.publication.id,
        e
      );
    });

    const { audioStream, videoStream } = await initStream();
    if (audioStream) {
      await me.publish(audioStream, { metadata: `main` });

      // マイクの有効無効をローカルストレージから復元
      const micStatus = localStorage.getItem("micStatus") ?? "enable";
      console.log(micStatus, localStorage.getItem("micStatus"));
      if (micStatus === "disable") {
        setIsEnableMic(false);
      }
      console.log("published audio");
    }
    if (videoStream) {
      await me.publish(videoStream, { metadata: `main` });

      // カメラの有効無効をローカルストレージから復元
      const cameraStatus = localStorage.getItem("cameraStatus") ?? "enable";
      if (cameraStatus === "disable") {
        setIsEnableCamera(false);
      }

      console.log("published video");
    }

    // return { room, me };
  }

  async function leaveRoom() {
    // 自分がpublishしたstreamをunpublish
    if (!room) return;

    for await (const stream of room.me.publications) {
      console.log(stream.id, stream.contentType);
      await room.me.unpublish(stream.id);
    }

    // roomからleave
    room.room.dispose();
    console.log("room disposed");
    setRoom(undefined);
  }

  async function startShareScreen() {
    if (!room) return;
    const { video, audio } =
      await window.skyway_room.SkyWayStreamFactory.createDisplayStreams({
        audio: true,
      });
    const publications: SSR.RoomPublication[] = [];
    publications.push(await room.me.publish(video, { metadata: `screen` }));
    if (audio) {
      publications.push(await room.me.publish(audio, { metadata: `screen` }));
    }
    setScreenShareStream(publications);
    // console.log("published", publications);

    // ブラウザ自体の共有停止ボタンによって停止された場合の処理
    video.onDestroyed.once(async () => {
      // console.log("画面共有がDestoryされました。");
      for await (const publication of publications) {
        await room.me.unpublish(publication);
      }
      setScreenShareStream(undefined);
    });
    // console.log(localVideoStream);
  }

  // 画面共有をやめるボタンが押された時の処理
  async function stopShareScreen() {
    if (!room || !screenShareStream) return;
    // console.log(room.me.publications, screenShareStream);
    for await (const publication of screenShareStream) {
      if (publication.stream && "track" in publication.stream) {
        publication.stream.track.stop();
      }
      await room.me.unpublish(publication);
    }
    setScreenShareStream(undefined);
  }

  useEffect(() => {
    joinRoom();
  }, []);

  useEffect(() => {
    const camera = room?.me.publications.find((p) => p.contentType === "video");
    if (!camera) return;
    let cameraStatus = "";
    if (isEnableCamera) {
      cameraStatus = "enable";
      camera.enable();
    } else {
      cameraStatus = "disable";
      camera.disable();
    }
    localStorage.setItem("cameraStatus", cameraStatus);
  }, [room, isEnableCamera]);

  useEffect(() => {
    const mic = room?.me.publications.find((p) => p.contentType === "audio");
    if (!mic) return;
    let micStatus = "";
    if (isEnableMic) {
      micStatus = "enable";
      mic.enable();
    } else {
      micStatus = "disable";
      mic.disable();
    }
    localStorage.setItem("micStatus", micStatus);
  }, [room, isEnableMic]);

  useEffect(() => {
    console.log("streams", streams);
  }, [streams]);

  return (
    <div
      class="video"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "3px",
        padding: "1em",
      }}
    >
      <Head>
        <script src="https://cdn.jsdelivr.net/npm/@skyway-sdk/room/dist/skyway_room-latest.js" />
      </Head>
      <div
        id="remote-media-area"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5em",
          justifyContent: "center",
        }}
      >
        {mediaStreamsData.map(
          ({ id, name, metadata, mediaStream, disableAudio }) => {
            const key = `${id}/${metadata}`;
            const isFullScreen = key === selectedFullScreenMediaKey;
            return (
              <div
                style={{
                  display: "flex",
                  position: "relative",
                  backgroundColor: "black",
                  borderRadius: "0.5em",
                }}
                onClick={() => {
                  setSelectedFullScreenMediaKey(key);
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    margin: "0.25em",
                    padding: "0.25em",
                    backgroundColor: "rgba(0,0,0,0.8)",
                    borderRadius: "0.5em",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25em",
                  }}
                >
                  {name}
                  {disableAudio && <SvgIcon icon="mic" on={false} width={16} />}
                </div>
                <video
                  style={{
                    maxWidth: "100%",
                    width: "20vw",
                    aspectRatio: "16/9",
                    objectFit: "cover",
                    borderRadius: "0.5em",
                  }}
                  ref={(ref) => {
                    if (!ref) return;
                    ref.srcObject = mediaStream;
                  }}
                  autoPlay
                />
                {isFullScreen && (
                  <dialog
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100vw",
                      height: "100vh",
                      margin: 0,
                      padding: 0,
                      borderRadius: 0,
                      backgroundColor: "rgba(0,0,0,0.8)",
                      zIndex: 10000,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    open
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("dialog click");
                      setSelectedFullScreenMediaKey(undefined);
                    }}
                  >
                    <div
                      style={{
                        width: "90%",
                        height: "90%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <video
                        style={{
                          objectFit: "contain",
                        }}
                        ref={(ref) => {
                          if (!ref) return;
                          ref.srcObject = mediaStream;
                        }}
                        autoPlay
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      />
                    </div>
                  </dialog>
                )}
              </div>
            );
          }
        )}
      </div>
      <div style={{ flexGrow: 1 }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5em",
        }}
      >
        <SvgIcon
          icon="mic"
          on={isEnableMic}
          width={24}
          onClick={() => {
            setIsEnableMic((prev) => !prev);
          }}
        />
        <SvgIcon
          icon="camera"
          on={isEnableCamera}
          width={24}
          onClick={() => {
            setIsEnableCamera((prev) => !prev);
          }}
        />
        <SvgIcon
          icon="screen"
          on={screenShareStream ? false : true}
          style={{
            backgroundColor: screenShareStream ? "red" : "transparent",
          }}
          onClick={() => {
            if (screenShareStream) stopShareScreen();
            else startShareScreen();
          }}
        />
        <div style={{ flexGrow: 1 }}></div>
        <SvgIcon
          icon="phone"
          on={room ? false : true}
          style={{
            backgroundColor: room ? "red" : "green",
          }}
          onClick={() => {
            if (room) leaveRoom();
            else joinRoom();
          }}
        />
      </div>
    </div>
  );
}
