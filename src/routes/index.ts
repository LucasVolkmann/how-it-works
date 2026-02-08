import { Router } from "express";
import authRouter from "../modules/auth/auth.routes.js"
import userRouter from "../modules/user/user.routes.js"
import { authMiddleware } from "../shared/middlewares/auth.middleware.js";
import { StatusCodes } from "http-status-codes";

const router = Router();

router.get("/health", (req, res) => {
    res.status(StatusCodes.OK).json({ status: "ok" });
});

router.use("/auth", authRouter);
router.use("/user", userRouter);

export default router;