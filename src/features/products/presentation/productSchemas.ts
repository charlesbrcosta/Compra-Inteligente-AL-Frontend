import { z } from 'zod';

const unitSchema = z.preprocess(
  (value) => (typeof value === 'string' ? value.toLowerCase().trim() : value),
  z.enum(['un', 'kg', 'g', 'l', 'ml', 'pct', 'cx'], {
    errorMap: () => ({ message: 'Use uma unidade valida: un, kg, g, l, ml, pct ou cx' }),
  }),
);

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Informe o produto'),
  quantity: z.coerce.number().positive('Informe uma quantidade maior que zero'),
  unit: unitSchema,
});

export type ProductFormData = z.infer<typeof productSchema>;
