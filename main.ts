/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "$std/dotenv/load.ts";

import { start, RenderFunction } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

const render: RenderFunction = (ctx, render) => {
  ctx.lang = "ja";
  render();
};

await start(manifest, { render });