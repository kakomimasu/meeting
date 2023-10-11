import { Head } from "$fresh/runtime.ts";
import { AppProps } from "$fresh/server.ts";

export default function App({ Component }: AppProps) {
  return (
    <html lang="ja">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/img/favicon-256.png" />
        <link rel="stylesheet" href="style.css" />
        <title>Kakomimasu Meeting</title>
      </Head>

      <body>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <img src="/img/favicon-256.png" width={50} height={50}></img>
          <h1>Kakomimasu Meeting</h1>
          <a href="https://github.com/kakomimasu">
            <img
              src="https://github.githubassets.com/favicons/favicon.png"
              width="16"
              height="16"
            />
            GitHub
          </a>
        </header>
        <Component />
      </body>
    </html>
  );
}
