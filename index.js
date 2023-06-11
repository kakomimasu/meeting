import { renderFileToString } from "dejs/mod.ts";

export class Index {
  async handle(user) {
    const body = await renderFileToString("index.ejs", { user });
    return new Response(body, {
      headers: { "content-type": "text/html" },
    });
  }
}
