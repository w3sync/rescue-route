import type { HttpStatus } from "./utils";

// Standardize Api Error class
export class ApiError extends Error {
  statusCode: HttpStatus;
  success: boolean;
  errors: any[];
  errorMessages: string;

  constructor(
    statusCode: HttpStatus,
    message: string = "Something went wrong",
    errors: any[] = [],
    stack?: string,

  ) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.errorMessages = message;

    if (stack) {
      this.stack = stack;
    }
    else {
      Error.captureStackTrace(this, this.constructor);
    }

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
