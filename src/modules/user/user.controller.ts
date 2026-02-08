import type { Response } from "express";
import { UsersService } from "./user.service.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import type { AuthRequest } from "../../shared/middlewares/auth.middleware.js";
import createHttpError from "http-errors";

const usersService = new UsersService();

export class UsersController {
  async getById(req: AuthRequest, res: Response) {
    if (!req.userId) throw createHttpError(StatusCodes.INTERNAL_SERVER_ERROR, ReasonPhrases.INTERNAL_SERVER_ERROR)
    const user = await usersService.getById(req.userId);
    return res.json(user);
  }

  async update(req: AuthRequest, res: Response) {
    if (!req.userId) throw createHttpError(StatusCodes.INTERNAL_SERVER_ERROR, ReasonPhrases.INTERNAL_SERVER_ERROR)
    const user = await usersService.update(req.userId, req.body);
    return res.json(user);
  }

  async delete(req: AuthRequest, res: Response) {
    if (!req.userId) throw createHttpError(StatusCodes.INTERNAL_SERVER_ERROR, ReasonPhrases.INTERNAL_SERVER_ERROR)
    await usersService.delete(req.userId);
    return res.status(StatusCodes.NO_CONTENT).send();
  }
}