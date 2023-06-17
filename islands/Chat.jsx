export default function Chat() {
  return (
    <>
      <script type="module" src="chat.js" />
      <div class="chat">
        <div class="message-div">
          <table id="messages"></table>
        </div>
        <div>
          <input id="input-msg" />
          <button id="send">送信</button>
        </div>
      </div>
    </>
  );
}
