import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/health", (req, res) => {
    res.status(200).json({ status: "ok 2" });
});

export default healthRouter;