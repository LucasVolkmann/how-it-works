import { Router } from "express";
import healthRouter from "./health.js";
import { routeNotFound } from "./notFound.js";

const utilsRouter = Router();

utilsRouter.use(healthRouter);
utilsRouter.use(routeNotFound);

export default utilsRouter;