import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateBody } from '../../shared/middlewares/validation.middleware.js';
import { loginSchema, registerSchema } from './auth.dto.js';

const router = Router();
const controller = new AuthController();

router.post('/register', validateBody(registerSchema), (req, res) =>
  controller.register(req, res),
);

router.post('/login', validateBody(loginSchema), (req, res) =>
  controller.login(req, res),
);

export default router;
