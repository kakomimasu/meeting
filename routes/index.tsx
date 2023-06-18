import { Handlers, PageProps } from "$fresh/server.ts";
import { UserArea } from "@/components/UserArea.tsx";
import ChatArea from "@/islands/ChatArea.tsx";
import VideoArea from "@/islands/VideoArea.tsx";
import { User } from "@/utils/database.ts";
import { State } from "@/routes/_middleware.ts";

export const handler: Handlers<User, State> = {
  GET(_req, ctx) {
    const user = ctx.state.user;
    return ctx.render(user);
  },
};

export default function Page({ data }: PageProps<User>) {
  return (
    <>
      <UserArea user={data} />
      <div class="main">
        <VideoArea />
        <ChatArea user={data} />
      </div>
    </>
  );
}
