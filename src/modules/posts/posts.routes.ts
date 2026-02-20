import { Router } from 'express';
import { PostsController } from './posts.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import {
  validateBody,
  validateParams,
} from '../../shared/middlewares/validation.middleware.js';
import {
  createPostSchema,
  getBySlugParamsSchema,
  paramsWithIdSchema,
  updatePostSchema,
} from './posts.dto.js';

const router = Router();
const controller = new PostsController();

router.get('/', (req, res) => controller.listPublished(req, res));
router.get('/:slug', validateParams(getBySlugParamsSchema), (req, res) =>
  controller.getBySlug(req, res),
);

router.post('/', authMiddleware, validateBody(createPostSchema), (req, res) =>
  controller.create(req, res),
);

router.put(
  '/:id',
  authMiddleware,
  validateParams(paramsWithIdSchema),
  validateBody(updatePostSchema),
  (req, res) => controller.update(req, res),
);

router.delete(
  '/:id',
  authMiddleware,
  validateParams(paramsWithIdSchema),
  (req, res) => controller.delete(req, res),
);

export default router;
