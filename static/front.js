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

const logined = document.getElementById("logined");
const userName = document.getElementById("user-name");
const userAvatarUrl = document.getElementById("user-avatar-url");

const user = await (await fetch("/user")).json();
logined.style.display = user == null ? "none" : "block";
if (user != null) {
  userName.textContent = user.name;
  userAvatarUrl.src = user.avatarUrl;
}
