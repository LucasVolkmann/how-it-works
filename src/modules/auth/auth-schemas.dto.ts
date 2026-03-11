import * as z from 'zod';

export const registerSchema = z.object({
  name: z
    .string('O nome é obrigatório e deve ser um texto.')
    .min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  email: z.email('Informe um endereço de e-mail válido.'),
  password: z
    .string('A senha é obrigatória e deve ser um texto.')
    .min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

export const loginSchema = z.object({
  email: z.email('Informe um endereço de e-mail válido.'),
  password: z
    .string('A senha é obrigatória e deve ser um texto.')
    .min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
