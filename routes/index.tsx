import { Handlers, PageProps } from "$fresh/server.ts";
import { UserArea } from "@/components/UserArea.tsx";
import ChatArea from "@/islands/ChatArea.tsx";
import VideoArea from "@/islands/VideoArea.tsx";
import { User } from "@/utils/database.ts";
import { State } from "@/routes/_middleware.ts";
import { getNewToken } from "@/utils/skyway.ts";

type PropsData = {
  user: User;
  skywayToken: string;
};

export const handler: Handlers<PropsData, State> = {
  GET(_req, ctx) {
    const user = ctx.state.user;
    const skywayToken = getNewToken();
    return ctx.render({ user, skywayToken });
  },
};

export default function Page({
  data: { user, skywayToken },
}: PageProps<PropsData>) {
  return (
    <>
      <UserArea user={user} />
      <div class="main">
        <VideoArea token={skywayToken} />
        <ChatArea user={user} />
      </div>
    </>
  );
}
