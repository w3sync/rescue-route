import { model } from "mongoose";

import { Role } from "@/lib";

import type { IUser } from "./user.modal";

import { userSchema } from "./user.modal";

export interface IAdmin extends IUser {
}

const adminSchema = userSchema.clone();

adminSchema.add({
  role: {
    type: String,
    enum: Object.values(Role),
    default: Role.ADMIN,
  },
});

export const Admin = model<IAdmin>("Admin", adminSchema);
