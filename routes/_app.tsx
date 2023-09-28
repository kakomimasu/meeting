import { Head } from "$fresh/runtime.ts";
import { AppProps } from "$fresh/server.ts";

export default function App({ Component }: AppProps) {
  return (
    <html lang="ja">
      <Head>
        <meta charSet="utf-8" />
        <link rel="stylesheet" href="style.css" />
        <title>Kakomimasu Meeting</title>
      </Head>

      <body>
        <h1>Kakomimasu Meeting</h1>
        <a href="https://github.com/kakomimasu">
          <img
            src="https://github.githubassets.com/favicons/favicon.png"
            width="16"
            height="16"
          />
          GitHub
        </a>
        <Component />
      </body>
    </html>
  );
}
