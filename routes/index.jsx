import User from "@/components/User.jsx";
import Chat from "@/islands/Chat.jsx";
import Video from "@/islands/Video.jsx";

export const handler = {
  GET(_req, ctx) {
    const user = ctx.state.user;
    return ctx.render({ user });
  },
};

export default function Page({ data }) {
  const { user } = data;
  return (
    <>
      <User user={user} />
      <div class="main">
        <Video />
        <Chat user={user} />
      </div>
    </>
  );
}
