import { z } from 'zod';

export const vehicleSchema = z.object({
  model: z.string().min(2, 'Informe o modelo'),
  fuelType: z.enum(['gasolina', 'etanol', 'diesel', 'gnv']),
  averageConsumptionKmPerLiter: z.coerce.number().positive('Informe um consumo maior que zero'),
  fuelPricePerLiter: z.coerce.number().positive('Informe um preco maior que zero'),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
