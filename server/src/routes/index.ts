import { Router } from "express";

import { adminRouter } from "./admin.routes";
import { userRouter } from "./user.routes";

const initRouter = Router();

initRouter.use("/user", userRouter);
initRouter.use("/admin", adminRouter);

export default initRouter;
