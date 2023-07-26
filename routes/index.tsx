import { Handlers, PageProps } from "$fresh/server.ts";
import { UserArea } from "@/components/UserArea.tsx";
import ChatArea from "@/islands/ChatArea.tsx";
import VideoArea from "@/islands/VideoArea.tsx";
import { User } from "@/utils/types.ts";

type PropsData = {
  user: User | null;
};

export default function Page({ state }: PageProps<PropsData>) {
  const user = state.user;

  return (
    <>
      <UserArea user={user} />
      {user && (
        <div class="main">
          <VideoArea />
          <ChatArea user={user} />
        </div>
      )}
    </>
  );
}
