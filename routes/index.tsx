import { defineRoute } from "$fresh/server.ts";
import { UserArea } from "@/components/UserArea.tsx";
import ChatArea from "@/islands/ChatArea.tsx";
import VideoArea from "@/islands/VideoArea.tsx";
import { User } from "@/utils/types.ts";
import { getNewToken, ROOM_NAME } from "@/utils/skyway.ts";
import { State } from "@/routes/_middleware.ts";

export default defineRoute<State>((_req, ctx) => {
  const user = ctx.state.user;
  const skywayToken = getNewToken();

  return (
    <>
      <UserArea user={user} />
      {user && (
        <div class="main">
          <VideoArea user={user} token={skywayToken} roomName={ROOM_NAME} />
          <ChatArea user={user} />
        </div>
      )}
    </>
  );
});
