import type { NextFunction, Request, Response } from "express";

import { createVerifier } from "fast-jwt";

import type { IUser } from "@/modals/user.modal";

import { ApiError, ApiResponse, asyncHandler, cookieOptions, HttpStatus, Role } from "@/lib";
import { User } from "@/modals/user.modal";

function removeSenstiveData(registeredUser: any) {
  const registeredUserWithoutPasswrod = registeredUser.toObject() as any;
  delete registeredUserWithoutPasswrod.password;
  delete registeredUserWithoutPasswrod.role;
  delete registeredUserWithoutPasswrod.refreshToken;

  return registeredUserWithoutPasswrod;
}

async function generateAccessAndRefreshToken(user: any) {
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

export const adminRegister = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const {
    firstName,
    middleName,
    lastName,
    email,
    phone,
    password,
  }: Partial<IUser> = req.body;

  if ([firstName, middleName, lastName, email, phone, password].some(field => field?.trim() === "")) {
    return res.status(HttpStatus.BAD_REQUEST).json(new ApiError(HttpStatus.BAD_REQUEST, "Every fields are requried"));
  }

  try {
    const alreadyUser = await User.findOne({
      email,
    });

    if (alreadyUser) {
      return res.status(HttpStatus.CONFLICT).json(new ApiResponse(HttpStatus.CONFLICT, null, "Already an User exist with that credientals"));
    }

    // Create a new instance of User but don't save it yet
    const user = new User({
      phone,
      password,
      firstName: firstName?.toLowerCase(),
      middleName: middleName?.toLowerCase(),
      lastName: lastName?.toLowerCase(),
      email: email?.toLowerCase(),
      role: Role.ADMIN,
      refreshToken: null,
    });

    // Validate the data without saving
    await user.validate();

    // If validation passes, save the user
    let registeredUser = await user.save();
    registeredUser = removeSenstiveData(registeredUser);
    return res.status(HttpStatus.CREATED).json(new ApiResponse(HttpStatus.CREATED, registeredUser, "User created Sucessfully"));
  }
  catch (error: any) {
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(HttpStatus.BAD_REQUEST).json(new ApiError(HttpStatus.BAD_REQUEST, "Validation error", validationErrors));
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "Server not responde"));
  }
});

export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const {
    email,
    password,
  } = req.body;

  if (!email && !password) {
    return res.status(HttpStatus.BAD_REQUEST).json(new ApiResponse(HttpStatus.BAD_REQUEST, null, "All Fields are required."));
  }

  try {
    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json(new ApiError(HttpStatus.NOT_FOUND, "No User found"));
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(HttpStatus.BAD_REQUEST).json(new ApiError(HttpStatus.BAD_REQUEST, "Credientals are invalid"));
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);

    const untangleUser = removeSenstiveData(user);

    return res.status(HttpStatus.OK).cookie("accessToken", accessToken, cookieOptions).cookie("refreshToken", refreshToken, cookieOptions).json(new ApiResponse(HttpStatus.OK, {
      user: untangleUser,
      accessToken,
      refreshToken,
    }, "User is logged In Successfully"));
  }
  catch (error: any) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ApiResponse(HttpStatus.SERVICE_UNAVAILABLE, null, "Error while login."));
  }
});

export const adminLogout = asyncHandler(async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(req?.user._id, {
    $unset: {
      refreshToken: "",
    },
  });

  return res.status(HttpStatus.OK).clearCookie("accessToken").clearCookie("refreshToken").json(new ApiResponse(HttpStatus.OK, null, "User Logged Out."));
});

export const adminRefreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken
    = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(HttpStatus.FORBIDDEN).json(new ApiError(401, "Unauthorize Request"));
  }

  try {
    const verify = createVerifier({
      key: async () => process.env.REFRESH_TOKEN_SECRET,
    });

    const decodedToken = await verify(incomingRefreshToken);

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid refresh Token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken }
      = await generateAccessAndRefreshToken(user);

    return res
      .status(HttpStatus.OK)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          HttpStatus.OK,
          {
            accessToken,
            refreshToken,
          },
          "AccessToken refreshed",
        ),
      );
  }
  catch (error) {
    throw new ApiError(401, "Invalid refresh Token", error as undefined);
  }
});

export const adminChangePassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword && !newPassword) {
    return res.status(HttpStatus.BAD_REQUEST).json(new ApiResponse(HttpStatus.BAD_REQUEST, null, "All fields are required."));
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return res.status(HttpStatus.NOT_FOUND).json(new ApiError(HttpStatus.BAD_REQUEST, "User not found."));
  }

  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(HttpStatus.OK)
    .json(new ApiResponse(HttpStatus.OK, null, "Password Change Successfully"));
});

export const adminUpdateAccountDetails = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, middleName, phone, email }: Partial<IUser> = req.body;

  const filteredValues = Object.fromEntries(
    Object.entries({ firstName, lastName, middleName, phone, email }).filter(
      ([_, value]) => value !== undefined,
    ),
  );

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: filteredValues,
    },
    {
      new: true,
      lean: true,
      runValidators: true,
    },
  );

  return res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, user, "Details are updated successfully"));
});

export const getCurrentAdmin = asyncHandler(async (req: Request, res: Response) => {
  return res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(HttpStatus.OK, req.user, "current user fetched successfully"),
    );
});

export const adminDeleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(HttpStatus.BAD_REQUEST).json(new ApiResponse(HttpStatus.BAD_REQUEST, null, "id doesn't exists."));
  }

  const isUser = await User.findById(id);

  if (!isUser) {
    return res.status(HttpStatus.NOT_FOUND).json(new ApiResponse(HttpStatus.NOT_FOUND, null, "no user exists with that id."));
  }

  await User.findByIdAndDelete(id);

  return res.status(HttpStatus.ACCEPTED).json(new ApiResponse(HttpStatus.ACCEPTED, null, "user is deleted"));
});
