import { z } from 'zod';

export const CheckoutSchema = z.object({
  reservationId: z.string().uuid(),
});

export type CheckoutDto = z.infer<typeof CheckoutSchema>;
