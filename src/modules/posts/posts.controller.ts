import type { Request, Response } from 'express';
import { PostsService } from './posts.service.js';
import type { AuthRequest } from '../../shared/middlewares/auth.middleware.js';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import createHttpError from 'http-errors';

const postsService = new PostsService();

interface IGetBySlugParams {
  slug?: string;
}
interface IParamsWithId {
  id?: string;
}
type AuthWithIdRequest = AuthRequest & Request<any, any, any, any, IParamsWithId>;

export class PostsController {
  async listPublished(req: Request, res: Response) {
    const posts = await postsService.listPublished();
    return res.json(posts);
  }

  async getBySlug(req: Request<IGetBySlugParams>, res: Response) {
    if (!req.params.slug)
      throw createHttpError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    const post = await postsService.getBySlug(req.params.slug);
    return res.json(post);
  }

  async create(req: AuthRequest, res: Response) {
    if (!req.userId)
      throw createHttpError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
    const post = await postsService.create(req.userId, req.body);
    return res.status(StatusCodes.CREATED).json(post);
  }

  async update(req: AuthWithIdRequest, res: Response) {
    if (!req.userId)
      throw createHttpError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
    const post = await postsService.update(req.userId, req.params.id, req.body);
    return res.json(post);
  }

  async delete(req: AuthWithIdRequest, res: Response) {
    if (!req.userId)
      throw createHttpError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
    await postsService.delete(req.userId!, req.params.id);
    return res.status(StatusCodes.NO_CONTENT).send();
  }
}
