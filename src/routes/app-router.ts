import { Router } from "express";
import publicRoutes from "./public/index.js";


const router = Router();

router.use(publicRoutes);

export default router;