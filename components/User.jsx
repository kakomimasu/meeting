export default function User({ user }) {
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