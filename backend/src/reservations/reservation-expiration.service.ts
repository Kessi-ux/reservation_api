import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  InventoryAction,
  ReservationStatus,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { PinoLogger } from 'nestjs-pino/PinoLogger';

@Injectable()
 export class ReservationExpirationService {
  // private readonly logger = new Logger(
  //   ReservationExpirationService.name,
  // );

  constructor(
    private prisma: PrismaService,
    private readonly logger: PinoLogger,
  ) {}

  /**
   * Runs every minute
   */
  @Cron('0 * * * * *')
  async expireReservations() {
    try {
      // this.logger.log(
      //   'Checking for expired reservations...',
      // );

      this.logger.info({
        event: 'EXPIRATION_JOB_STARTED',
        timestamp: new Date().toISOString(),
      });

      const expiredReservations = await this.prisma.reservation.findMany({
        where: {
          status: ReservationStatus.ACTIVE,
          expiresAt: {
            lte: new Date(),
          },
        },
      });

      if (expiredReservations.length === 0) {
        this.logger.info({
          event: 'NO_EXPIRED_RESERVATIONS_FOUND',
        });

        return;
      }

      for (const reservation of expiredReservations) {
        await this.prisma.$transaction(async (tx) => {
          // ----------------------------------
          // 1. Restore stock
          // ----------------------------------
          await tx.product.update({
            where: {
              id: reservation.productId,
            },
            data: {
              stock: {
                increment: reservation.quantity,
              },
            },
          });

          this.logger.info({
            event: 'STOCK_RESTORED',
            productId: reservation.productId,
            quantityRestored: reservation.quantity,
          });

          // ----------------------------------
          // 2. Mark reservation expired
          // ----------------------------------
          await tx.reservation.update({
            where: {
              id: reservation.id,
            },
            data: {
              status: ReservationStatus.EXPIRED,
            },
          });

          this.logger.info({
            event: 'RESERVATION_MARKED_EXPIRED',
            reservationId: reservation.id,
          });

          // ----------------------------------
          // 3. Inventory audit log
          // ----------------------------------
          await tx.inventoryLog.create({
            data: {
              productId: reservation.productId,
              action: InventoryAction.RELEASE,
              quantity: reservation.quantity,
              referenceId: reservation.id,
            },
          });

          this.logger.info({
            event: 'INVENTORY_LOG_CREATED',
            reservationId: reservation.id,
            action: InventoryAction.RELEASE,
          });
        });

        // this.logger.log(
        //   `Expired reservation ${reservation.id}`,
        // );

        this.logger.info({
          event: 'RESERVATION_EXPIRED',
          reservationId: reservation.id,
          productId: reservation.productId,
          quantity: reservation.quantity,
        });
      }
    } catch (error) {
      this.logger.error({
        event: 'EXPIRATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw error;
    }
  }
}
