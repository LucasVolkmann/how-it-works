import { z } from 'zod';

export const createPostSchema = z.object({
  title: z
    .string('O título é obrigatório e deve ser um texto.')
    .min(3, 'O título deve ter pelo menos 3 caracteres.'),
  content: z
    .string('O conteúdo é obrigatório e deve ser um texto.')
    .min(10, 'O conteúdo deve ter pelo menos 10 caracteres.'),
  published: z
    .boolean('O campo "publicado" deve ser verdadeiro ou falso.')
    .optional(),
});
export type CreatePostDTO = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  title: z
    .string('O título deve ser um texto.')
    .min(3, 'O título deve ter pelo menos 3 caracteres.')
    .optional(),
  content: z
    .string('O conteúdo deve ser um texto.')
    .min(10, 'O conteúdo deve ter pelo menos 10 caracteres.')
    .optional(),
  published: z
    .boolean('O campo "publicado" deve ser verdadeiro ou falso.')
    .optional(),
});
export type UpdatePostDTO = z.infer<typeof updatePostSchema>;

export const getBySlugParamsSchema = z.object({
  slug: z
    .string('O slug é obrigatório e deve ser um texto.')
    .min(3, 'O slug deve ter pelo menos 3 caracteres.'),
});
export type GetBySlugParamsDTO = z.infer<typeof getBySlugParamsSchema>;

export const paramsWithIdSchema = z.object({
  id: z.guid('O ID informado não é um UUID válido.'),
});
export type ParamsWithIdDTO = z.infer<typeof paramsWithIdSchema>;
