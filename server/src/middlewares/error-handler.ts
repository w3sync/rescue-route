import type { NextFunction, Request, Response } from "express";

import { ApiError, HttpStatus } from "@/lib";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const isDev = process.env.NODE_ENV === "development";

  if (err instanceof ApiError) {
    if (isDev)
      console.error("API Error:", err);

    res.status(err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message || "An unexpected error occurred",
      errors: isDev ? err.errors : undefined,
      stack: isDev ? err.stack : undefined,
    });
    return;
  }

  console.error("Unhandled Error:", err);

  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal Server Error",
  });
}
