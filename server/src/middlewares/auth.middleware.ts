import type { Request } from "express";

import { createVerifier } from "fast-jwt";

import { ApiError, asyncHandler, HttpStatus, Role } from "@/lib";
import { Admin } from "@/modals/admin.modal";

export const verifyAdmin = asyncHandler(async (req: Request, _, next) => {
  try {
    const token
      = req.cookies?.accessToken
        || req.header("Authorization")?.replace("Bearer", "");

    if (!token) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, "Unauthorized requrest");
    }

    const verify = createVerifier({
      key: async () => process.env.ACCESS_TOKEN_SECRET,
    });

    const decodedToken = await verify(token.trim());
    const user = await Admin.findById(decodedToken._id);

    if (!user || user.role !== Role.ADMIN) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  }
  catch (error) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid Access Token", error as undefined);
  }
});

export const verifyUser = asyncHandler(async (req: Request, _, next) => {
  try {
    const token
      = req.cookies?.accessToken
        || req.header("Authorization")?.replace("Bearer", "");

    if (!token) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, "Unauthorized requrest");
    }

    const verify = createVerifier({
      key: async () => process.env.ACCESS_TOKEN_SECRET,
    });

    const decodedToken = await verify(token);

    const user = await Admin.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  }
  catch (error) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid Access Token", error as undefined);
  }
});
