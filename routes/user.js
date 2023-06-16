export function handler(_req, ctx) {
  return Response.json(ctx.state.user);
}
