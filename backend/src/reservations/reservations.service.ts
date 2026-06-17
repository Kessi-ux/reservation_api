import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReserveSchema } from './dto/reserve.dto';
import {
  InventoryAction,
  ReservationStatus,
} from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Reserve a product using LOCK LAYER approach
   * - stock is NOT reduced
   * - reservations act as temporary holds
   * - availability is computed dynamically
   */
  async reserve(body: unknown) {
    // -----------------------------
    // 1. Validate input
    // -----------------------------
    const data = ReserveSchema.parse(body);

    const userId = data.userId;

    // Reservation expiry time (e.g. 15 mins lock)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      // -----------------------------
      // 2. Fetch product
      // -----------------------------
      const product = await tx.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        throw new BadRequestException('Product not found');
      }

      // -----------------------------
      // 3. Calculate locked (reserved) quantity
      // -----------------------------
      const activeReservations = await tx.reservation.aggregate({
        where: {
          productId: data.productId,
          status: ReservationStatus.ACTIVE,
          expiresAt: {
            gt: new Date(),
          },
        },
        _sum: {
          quantity: true,
        },
      });

      const reservedQty = activeReservations._sum.quantity ?? 0;

      // -----------------------------
      // 4. Compute available stock (LOCK LAYER RULE)
      // -----------------------------
      const availableStock = product.stock - reservedQty;

      // Prevent over-reservation
      if (data.quantity > availableStock) {
        throw new BadRequestException('Insufficient available stock');
      }

      // -----------------------------
      // 5. Check if user already has ACTIVE reservation
      //    (merge behavior, not blocking)
      // -----------------------------
      const existingReservation = await tx.reservation.findFirst({
        where: {
          userId,
          productId: data.productId,
          status: ReservationStatus.ACTIVE,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      let reservation;

      // -----------------------------
      // 6. Merge or create reservation
      // -----------------------------
      if (existingReservation) {
        // If exists → increase quantity
        reservation = await tx.reservation.update({
          where: { id: existingReservation.id },
          data: {
            quantity: {
              increment: data.quantity,
            },
          },
        });
      } else {
        // If not exists → create new reservation
        reservation = await tx.reservation.create({
          data: {
            userId,
            productId: data.productId,
            quantity: data.quantity,
            expiresAt,
            status: ReservationStatus.ACTIVE,
          },
        });
      }

      // -----------------------------
      // 7. Log inventory action
      // -----------------------------
      await tx.inventoryLog.create({
        data: {
          productId: data.productId,
          action: InventoryAction.RESERVE,
          quantity: data.quantity,
          referenceId: reservation.id,
        },
      });

      // -----------------------------
      // 8. Response
      // -----------------------------
      return {
        reservationId: reservation.id,
        expiresAt,
        availableStock: availableStock - data.quantity, // optional for frontend
      };
    });
  }
}