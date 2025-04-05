import type { Request, Response } from "express";

import { createVerifier } from "fast-jwt";

import { ApiError, asyncHandler, HttpStatus, Role } from "@/lib";
import { User } from "@/modals/user.modal";

export const verifyAdmin = asyncHandler(async (req: Request, res: Response, next) => {
  const token = req.cookies?.accessToken
    || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res.status(HttpStatus.UNAUTHORIZED).json(
      new ApiError(HttpStatus.UNAUTHORIZED, "Unauthorized request"),
    );
    return;
  }

  const verify = createVerifier({
    key: async () => process.env.ACCESS_TOKEN_SECRET,
  });

  try {
    const decodedToken = await verify(token.trim());
    const user = await User.findById(decodedToken._id);

    if (!user || user.role !== Role.ADMIN) {
      res.status(HttpStatus.UNAUTHORIZED)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiError(HttpStatus.UNAUTHORIZED, "Invalid Access Token"));
      return;
    }

    req.user = user;
    next();
  }
  catch (error) {
    res.status(HttpStatus.UNAUTHORIZED)
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .json(new ApiError(HttpStatus.UNAUTHORIZED, "Invalid Access Token"));
  }
});

export const verifyUser = asyncHandler(async (req: Request, res: Response, next) => {
  const token = req.cookies?.accessToken
    || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res.status(HttpStatus.UNAUTHORIZED).json(
      new ApiError(HttpStatus.UNAUTHORIZED, "Unauthorized request"),
    );
    return;
  }

  const verify = createVerifier({
    key: async () => process.env.ACCESS_TOKEN_SECRET,
  });

  try {
    const decodedToken = await verify(token.trim());
    const user = await User.findById(decodedToken._id);

    if (!user || user.role !== Role.USER) {
      res.status(HttpStatus.UNAUTHORIZED)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiError(HttpStatus.UNAUTHORIZED, "Invalid Access Token"));
      return;
    }

    req.user = user;
    next();
  }
  catch (error) {
    res.status(HttpStatus.UNAUTHORIZED)
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .json(new ApiError(HttpStatus.UNAUTHORIZED, "Invalid Access Token"));
  }
});
