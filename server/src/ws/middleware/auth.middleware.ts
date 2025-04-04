import type { Socket } from "socket.io";

import { createVerifier } from "fast-jwt";

import { User } from "@/modals/user.modal";

export async function userAuth(socket: Socket, next: any) {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error: Token required"));
    }

    // Verify JWT token
    const verify = createVerifier({
      key: async () => process.env.ACCESS_TOKEN_SECRET,
    });

    const decodedToken = await verify(token);

    if (!decodedToken._id) {
      return next(new Error("Authentication error: Token required"));
    }

    const user = await User.findById(decodedToken._id);

    if (!user) {
      return next(new Error("Authentication error: Token required"));
    }

    // Attach user data to socket
    socket.user = user;

    next();
  }
  catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error("Authentication failed"));
  }
}
