import bcrypt from "bcryptjs";
import { createSigner } from "fast-jwt";
import { model, Schema } from "mongoose";

import { Role } from "@/lib";

export interface IUser {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  password: string;
  refreshToken: string;
  comparePassword: (passwordd: string) => Promise<boolean>;
  generateAccessToken: () => Promise<string>;
  generateRefreshToken: () => Promise<string>;
}

export const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      minlength: [3, "First name must be at least 3 characters long"],
      maxlength: [50, "First name must not exceed 50 characters"],
      trim: true,
      lowercase: true,
    },
    middleName: {
      type: String,
      minlength: [3, "Middle name must be at least 3 characters long"],
      maxlength: [50, "Middle name must not exceed 50 characters"],
      default: "",
      trim: true,
      lowercase: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minlength: [3, "Last name must be at least 3 characters long"],
      maxlength: [50, "Last name must not exceed 50 characters"],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
        "Invalid email format",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      match: [/^(\+91)?[6-9]\d{9}$/, "Invalid Indian phone number format"],
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  }
  catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  const sign = createSigner({
    key: async () => process.env.ACCESS_TOKEN_SECRET!,
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY!,
  });

  const payload = {
    _id: this._id,
  };

  return await sign(payload);
};

userSchema.methods.generateRefreshToken = async function () {
  const sign = createSigner({
    key: async () => process.env.REFRESH_TOKEN_SECRET!,
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY!,
  });

  const payload = {
    _id: this._id,
  };

  return await sign(payload);
};

export const User = model<IUser>("User", userSchema);
