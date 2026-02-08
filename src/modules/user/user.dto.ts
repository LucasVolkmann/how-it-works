import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
});
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
