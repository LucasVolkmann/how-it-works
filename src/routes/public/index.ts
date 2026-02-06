import { Router } from "express";
import utilsRouter from "./utils/index.js";

const publicRoutes = Router();

publicRoutes.use(utilsRouter);

export default publicRoutes;