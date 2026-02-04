import { Router } from "express";
import utilRoutes from "./utils/index.js";

const publicRoutes = Router();

publicRoutes.use(utilRoutes);

export default publicRoutes;