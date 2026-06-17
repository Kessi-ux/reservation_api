import { z } from 'zod';

export const ReserveSchema = z.object({
  userId: z.uuid(),
  productId: z.uuid(),
  quantity: z.number().int().positive(),
});

export type ReserveDto = z.infer<typeof ReserveSchema>;
