import { Router } from "express";

import { getCurrentUser, test, userChangePassword, userLogin, userLogout, userRefreshAccessToken, userRegister, userUpdateAccountDetails } from "@/controllers/user.controller";
import { verifyAdmin, verifyUser } from "@/middlewares/auth.middleware";

export const userRouter = Router();

userRouter.route("/test").post(test);
userRouter.route("/login").post(userLogin);
userRouter.route("/register").post(verifyAdmin, userRegister);
userRouter.route("/logout").post(verifyUser, userLogout);
userRouter.route("/me").get(verifyUser, getCurrentUser);
userRouter.route("/refresh-token").post(verifyUser, userRefreshAccessToken);
userRouter.route("/password-change").put(verifyUser, userChangePassword);
userRouter.route("/update-account-details").patch(verifyAdmin, userUpdateAccountDetails);
