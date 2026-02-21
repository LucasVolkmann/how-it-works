import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  published: z.boolean().optional(),
});
export type CreatePostDTO = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  title: z.string().min(3).optional(),
  content: z.string().min(10).optional(),
  published: z.boolean().optional(),
});
export type UpdatePostDTO = z.infer<typeof updatePostSchema>;

export const getBySlugParamsSchema = z.object({
  slug: z.string().min(3),
});
export type GetBySlugParamsDTO = z.infer<typeof getBySlugParamsSchema>;

export const paramsWithIdSchema = z.object({
  id: z.guid(),
});
export type ParamsWithIdDTO = z.infer<typeof paramsWithIdSchema>;
