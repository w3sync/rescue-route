import { Router } from "express";

import { adminChangePassword, adminDeleteUser, adminLogin, adminLogout, adminRefreshAccessToken, adminRegister, adminUpdateAccountDetails, getCurrentAdmin } from "@/controllers/admin.controller";
import { verifyAdmin } from "@/middlewares/auth.middleware";

export const adminRouter = Router();

adminRouter.route("/login").post(adminLogin);
adminRouter.route("/register").post(adminRegister);
adminRouter.route("/logout").post(verifyAdmin, adminLogout);
adminRouter.route("/me").get(verifyAdmin, getCurrentAdmin);
adminRouter.route("/refresh-token").post(verifyAdmin, adminRefreshAccessToken);
adminRouter.route("/password-change").put(verifyAdmin, adminChangePassword);
adminRouter.route("/update-account-details").patch(verifyAdmin, adminUpdateAccountDetails);
adminRouter.route("/remove-user/:id").get(verifyAdmin, adminDeleteUser);
