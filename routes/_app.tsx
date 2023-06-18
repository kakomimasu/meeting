import { Head } from "$fresh/runtime.ts";
import { AppProps } from "$fresh/server.ts";

export default function App(props: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <link rel="stylesheet" href="style.css" />
        <title>Kakomimasu Meeting</title>
      </Head>

      <h1>Kakomimasu Meeting</h1>
      <props.Component />
    </>
  );
}
