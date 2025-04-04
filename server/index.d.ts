import type { Handshake } from "node_modules/socket.io/dist/socket-types";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

declare module "socket.io" {
  interface Socket {
    user?: any;
    handshake: Handshake;
  }
}
