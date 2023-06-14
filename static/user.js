const signin = document.getElementById("signin");
const signout = document.getElementById("signout");
const userName = document.getElementById("user-name");
const userIcon = document.getElementById("user-icon");

const user = await(await fetch("/user")).json();
if (user != null) {
  signin.style.display = "none";
  signout.style.display = "inline";
  userName.textContent = user.name;
  userIcon.src = user.avatarUrl;
} else {
  signin.style.display = "inline";
  signout.style.display = "none";
  userName.textContent = "ゲスト";
  userIcon.src = "";
}
