import { Router } from "express";
import { routeNotFound } from "../shared/middlewares/not-found.middleware.js";


const router = Router();

router.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});



router.use(routeNotFound);
export default router;