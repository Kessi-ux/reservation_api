import { z } from 'zod';

export const ReserveSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().positive(),
});

export type ReserveDto = z.infer<typeof ReserveSchema>;
