import { User } from "@/utils/types.ts";

export function UserArea({ user }: { user: User | null }) {
  return (
    <div>
      <img src={user ? user.avatarUrl : ""} width={32} />
      <span>{user ? user.name : "ゲスト"}</span>
      <a href="/auth/signin" style={{ display: user ? "none" : "inline" }}>
        ログイン
      </a>
      <a href="/auth/signout" style={{ display: user ? "inline" : "none" }}>
        ログアウト
      </a>
    </div>
  );
}
