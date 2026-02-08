import { Router, type Request } from "express";
import { UsersController } from "./user.controller.js";
import { validateBody } from "../../shared/middlewares/validation.middleware.js";
import { updateUserSchema } from "./user.dto.js";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";

const router = Router();
const controller = new UsersController();

router.use(authMiddleware);

router.get("/", (req, res) => controller.getById(req, res));

router.put("/", validateBody(updateUserSchema), (req, res) => controller.update(req, res));

router.delete("/", (req, res) => controller.delete(req, res));

export default router;