import type { HttpStatus } from "./utils";

// Standardize Api Response class
export class ApiResponse<T> {
  status: HttpStatus;
  data?: T;
  message: string;
  success: boolean;

  constructor(status: HttpStatus, data?: T, message: string = "Success") {
    this.status = status;
    this.data = data;
    this.message = message;
    this.success = status < 400;
  }
}
