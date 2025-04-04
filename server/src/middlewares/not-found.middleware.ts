import type { NextFunction, Request, Response } from "express";

import { HttpStatus } from "@/lib";

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
    error: `Route not exists ${req.path}`,
  });
}
