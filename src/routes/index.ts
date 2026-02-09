import { Router } from 'express';
import authRouter from '../modules/auth/auth.routes.js';
import userRouter from '../modules/users/users.routes.js';
import { StatusCodes } from 'http-status-codes';

const router = Router();

router.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({ status: 'ok' });
});

router.use('/auth', authRouter);
router.use('/users', userRouter);

export default router;
