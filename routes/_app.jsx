import { Head } from "$fresh/runtime.ts";

export default function App({ Component }) {
  return (
    <>
      <Head>
        <meta charset="utf-8" />
        <link rel="stylesheet" href="style.css" />
        <title>Kakomimasu Meeting</title>
      </Head>

      <h1>Kakomimasu Meeting</h1>
      <Component />
    </>
  );
}
