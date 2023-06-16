export const handler = {
  GET(_req, ctx) {
    return Response.json(ctx.state.user);
  },
};
