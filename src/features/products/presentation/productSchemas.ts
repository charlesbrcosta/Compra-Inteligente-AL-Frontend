import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Informe o produto'),
  quantity: z.coerce.number().positive('Informe uma quantidade maior que zero'),
  unit: z.enum(['un', 'kg', 'g', 'l', 'ml', 'pct', 'cx']),
});

export type ProductFormData = z.infer<typeof productSchema>;
