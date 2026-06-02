import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Informe um e-mail valido'),
  password: z.string().min(4, 'Use ao menos 4 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Informe seu nome'),
  email: z.string().email('Informe um e-mail valido'),
  city: z.string().min(2, 'Informe sua cidade'),
  neighborhood: z.string().min(2, 'Informe seu bairro'),
  password: z.string().min(4, 'Use ao menos 4 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
