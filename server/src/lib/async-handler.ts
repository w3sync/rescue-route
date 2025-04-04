import type { NextFunction, Response } from "express";

import type { CRequest } from "./utils";

export function asyncHandler(fn: (req: CRequest, res: Response, next: NextFunction) => Promise<any>) {
  return (req: CRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
