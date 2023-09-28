import { encode } from "https://deno.land/std@0.196.0/encoding/base64.ts";
import { create } from "https://deno.land/x/djwt@$VERSION/mod.ts";

async function getJWT() {
  const nowUnixTimeSec = Math.floor(new Date().getTime() / 1000);
  const iat = nowUnixTimeSec - 60; // 現在日時（APIサーバとの時間ずれ対策のため1分前にする）
  const exp = nowUnixTimeSec + 3 * 60; // 有効期限
  const jwt = await create({ alg: "HS256", typ: "JWT" }, {
    iss: Deno.env.get("GITHUB_APP_ID"),
    "iat": iat,
    "exp": exp,
  }, Deno.env.get("GITHUB_APP_CLIENT_SECRET"));
  return jwt;
}

// https://zenn.dev/tmknom/articles/github-apps-token

function base64Url(data: string) {
  return encode(data).replace("+", "-").replace("/", "_").replace("=", "");
}

const keyPair = await crypto.subtle.generateKey(
  {
    name: "RSA-PSS",
    modulusLength: 2048,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    hash: { name: "SHA-256" },
  },
  true,
  ["sign", "verify"],
);

async function sign(key: CryptoKey, data: BufferSource) {
  await crypto.subtle.sign({ name: "RSA-PSS", saltLength: 32 }, key, data);
}
