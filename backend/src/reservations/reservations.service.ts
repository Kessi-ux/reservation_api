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
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: PinoLogger,
  ) {}

  /**
   * Reserve a product (ATOMIC + RACE-CONDITION SAFE)
   */
  async reserve(
    userId: string,
    productId: string,
    quantity: number,
  ) {
    // Validate input
    ReserveSchema.parse({
      productId,
      quantity,
    });

    this.logger.info({
      event: 'RESERVATION_REQUEST',
      userId,
      productId,
      quantity,
    });

    const expiresAt = new Date(
      Date.now() + 15 * 60 * 1000,
    );

    return this.prisma.$transaction(async (tx) => {
      // Atomically reduce stock
      const updateResult =
        await tx.product.updateMany({
          where: {
            id: productId,
            stock: {
              gte: quantity,
            },
          },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        });

      if (updateResult.count === 0) {
        throw new BadRequestException(
          'Insufficient stock',
        );
      }

      // Merge existing reservation if one exists
      const existingReservation =
        await tx.reservation.findFirst({
          where: {
            userId,
            productId,
            status: ReservationStatus.ACTIVE,
            expiresAt: {
              gt: new Date(),
            },
          },
        });

      let reservation;

      if (existingReservation) {
        reservation = await tx.reservation.update({
          where: {
            id: existingReservation.id,
          },
          data: {
            quantity: {
              increment: quantity,
            },
          },
        });
      } else {
        reservation =
          await tx.reservation.create({
            data: {
              userId,
              productId,
              quantity,
              expiresAt,
              status:
                ReservationStatus.ACTIVE,
            },
          });

        this.logger.info({
          event: 'RESERVATION_CREATED',
          reservationId: reservation.id,
        });
      }

      // Inventory log
      await tx.inventoryLog.create({
        data: {
          productId,
          action: InventoryAction.RESERVE,
          quantity,
          referenceId: reservation.id,
        },
      });

      this.logger.info({
        event: 'RESERVATION_SUCCESS',
        reservationId: reservation.id,
      });

      return {
        reservationId: reservation.id,
        expiresAt,
        message:
          'Product reserved successfully',
      };
    });
  }
}
