import { Router } from "express";
import healthRouter from "./health.js";
import { routeNotFound } from "./notFound.js";

const utilRoutes = Router();

utilRoutes.use(healthRouter);
utilRoutes.use(routeNotFound);

export default utilRoutes;