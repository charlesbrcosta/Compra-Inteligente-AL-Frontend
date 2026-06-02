import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'Informe seu nome'),
  email: z.string().email('Informe um e-mail valido'),
  city: z.string().min(2, 'Informe sua cidade'),
  neighborhood: z.string().min(2, 'Informe seu bairro'),
});

export type UserFormData = z.infer<typeof userSchema>;
