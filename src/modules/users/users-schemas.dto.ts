import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z
    .string('O nome deve ser um texto.')
    .min(3, 'O nome deve ter pelo menos 3 caracteres.')
    .optional(),
});
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
