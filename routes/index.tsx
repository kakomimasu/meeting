import { defineRoute } from "$fresh/server.ts";
import { UserArea } from "@/components/UserArea.tsx";
import ChatArea from "@/islands/ChatArea.tsx";
import VideoArea from "@/islands/VideoArea.tsx";
import WhiteBoardArea2 from "@/islands/WhiteBoardArea2.tsx";
import { User, State } from "@/utils/types.ts";
import { getNewToken, ROOM_NAME } from "@/utils/skyway.ts";

export default defineRoute<State>((_req, ctx) => {
  const user = ctx.state.user;
  const skywayToken = getNewToken();

  return (
    <>
      <UserArea user={user} />
      {user && (
        <div class="main">
          <VideoArea user={user} token={skywayToken} roomName={ROOM_NAME} />
          <ChatArea user={user} groupId="0" />
          <WhiteBoardArea2 />
        </div>
      )}
    </>
  );
});
