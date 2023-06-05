/// <reference lib="dom"/>

const messages = document.getElementById("messages");
const inputMessage = document.getElementById("input-msg");
const send = document.getElementById("send");
let es = new EventSource(window.location.href + "chat");

function setMessages(msgs) {
  messages.innerHTML = "";
  msgs.forEach((msg) => {
    const td = document.createElement("td");
    td.textContent = msg;
    const tr = document.createElement("tr");
    tr.appendChild(td);
    messages.appendChild(tr);
  });
}

const data = await (await fetch("/chat")).json();
setMessages(data);

es.addEventListener("message", (e) => {
  const newData = JSON.parse(e.data);
  setMessages(newData);
});

es.addEventListener("error", async () => {
  es.close();
  const backoff = 10000 + Math.random() * 5000;
  await new Promise((resolve) => setTimeout(resolve, backoff));
  es = new EventSource(window.location.href + "chat");
});

send.addEventListener("click", async () => {
  const form = new FormData();
  form.append("msg", inputMessage.value);
  await fetch("chat", {
    method: "POST",
    body: form,
  });
});

let localStream;

// カメラ映像取得
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then((stream) => {
    // 成功時にvideo要素にカメラ映像をセットし、再生
    const videoElm = document.getElementById("my-video");
    videoElm.srcObject = stream;
    videoElm.play();
    // 着信時に相手にカメラ映像を返せるように、グローバル変数に保存しておく
    localStream = stream;
  }).catch((error) => {
    // 失敗時にはエラーログを出力
    console.error("mediaDevice.getUserMedia() error:", error);
    return;
  });
