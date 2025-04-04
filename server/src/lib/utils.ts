import { ApiError } from "./api-error";

// HTTP Status Codes
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

export const cookieOptions = {
  httpOnly: true,
  secure: true,
};

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export function removeSenstiveData(registeredUser: any) {
  const registeredUserWithoutPasswrod = registeredUser.toObject() as any;
  delete registeredUserWithoutPasswrod.password;
  delete registeredUserWithoutPasswrod.role;
  delete registeredUserWithoutPasswrod.refreshToken;

  return registeredUserWithoutPasswrod;
}

export async function generateAccessAndRefreshToken(user: any) {
  try {
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
  catch (error) {
    console.log("ERROR :: While Generating Refress and access token");
    throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
