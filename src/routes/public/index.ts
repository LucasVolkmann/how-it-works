import { Router } from "express";
import healthRouter from "./health.route.js";
import { routeNotFound } from "./not-found.route.js";

const publicRouter = Router();

publicRouter.use(healthRouter);
publicRouter.use(routeNotFound);

export default publicRouter;