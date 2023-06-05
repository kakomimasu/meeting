export class Router {
  constructor() {
    this.map = new Map();
  }
  add(method, path, handler) {
    this.map.set(method + " " + path, handler);
  }
  get(req) {
    const url = new URL(req.url);
    return this.map.get(req.method + " " + url.pathname);
  }
}
