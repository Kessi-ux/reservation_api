import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReserveSchema } from './dto/reserve.dto';
import { CheckoutSchema } from './dto/checkout.dto';
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
   * Reserve a product (ATOMIC + RACE-CONDITION SAFE VERSION)
   *
   * FLOW:
   * 1. Validate input
   * 2. Atomically deduct stock (if available)
   * 3. Create reservation as a temporary lock
   * 4. Log inventory action
   *
   * WHY THIS WORKS:
   * - stock check + update happens in ONE SQL operation
   * - prevents race conditions under concurrent requests
   */
  async reserve(body: unknown) {
    // -----------------------------
    // 1. Validate input (Zod)
    // -----------------------------
    const data = ReserveSchema.parse(body);

    this.logger.info({
      event: 'RESERVATION_REQUEST',
      userId: data.userId,
      productId: data.productId,
      quantity: data.quantity,
    });

    const userId = data.userId;

    // Reservation expiry (temporary lock duration)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      // -----------------------------
      // 2. ATOMIC STOCK DEDUCTION
      // -----------------------------
      // This is the MOST IMPORTANT PART.
      // It ensures:
      // - stock is only reduced if enough exists
      // - prevents overselling under concurrency
      const updateResult = await tx.product.updateMany({
        where: {
          id: data.productId,
          stock: {
            gte: data.quantity, // ONLY update if enough stock exists
          },
        },
        data: {
          stock: {
            decrement: data.quantity, // atomic decrement
          },
        },
      });

      // If no rows were updated → stock was insufficient
      if (updateResult.count === 0) {
        throw new BadRequestException(
          'Insufficient stock',
        );
      }

      // -----------------------------
      // 3. CHECK IF USER ALREADY HAS ACTIVE RESERVATION
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
      // 4. CREATE OR MERGE RESERVATION
      // -----------------------------
      if (existingReservation) {
        // Merge logic: increase quantity
        reservation = await tx.reservation.update({
          where: {
            id: existingReservation.id,
          },
          data: {
            quantity: {
              increment: data.quantity,
            },
          },
        });
      } else {
        // Create new reservation
        reservation = await tx.reservation.create({
          data: {
            userId,
            productId: data.productId,
            quantity: data.quantity,
            expiresAt,
            status: ReservationStatus.ACTIVE,
          },
        });

        this.logger.info({
          event: 'RESERVATION_CREATED',
          reservationId: reservation.id,
        });
      }

      // -----------------------------
      // 5. LOG INVENTORY ACTION
      // -----------------------------
      await tx.inventoryLog.create({
        data: {
          productId: data.productId,
          action: InventoryAction.RESERVE,
          quantity: data.quantity,
          referenceId: reservation.id,
        },
      });

      this.logger.info({
        event: 'RESERVATION_SUCCESS',
        reservationId: reservation.id,
      });

      // -----------------------------
      // 6. RESPONSE
      // -----------------------------
      return {
        reservationId: reservation.id,
        expiresAt,
        message: 'Product reserved successfully',
      };
    });
  }

  async checkout(body: unknown) {
  // -----------------------------
  // 1. Validate input
  // -----------------------------
  const data = CheckoutSchema.parse(body);
    this.logger.info({
      event: 'CHECKOUT_REQUEST',
      reservationId: data.reservationId,
    });
  return this.prisma.$transaction(async (tx) => {

    // -----------------------------
    // 2. Fetch reservation
    // -----------------------------
    const reservation = await tx.reservation.findUnique({
      where: { id: data.reservationId },
      include: {
        product: true,
      },
    });

    if (!reservation) {
      throw new BadRequestException('Reservation not found');
    }

    // -----------------------------
    // 3. Check reservation status
    // -----------------------------
    if (reservation.status !== ReservationStatus.ACTIVE) {
      throw new BadRequestException('Reservation is not active');
    }

    // -----------------------------
    // 4. Check expiration
    // -----------------------------
    if (reservation.expiresAt < new Date()) {
      throw new BadRequestException('Reservation expired');
    }

    // -----------------------------
    // 5. Create Order
    // -----------------------------
    const order = await tx.order.create({
      data: {
        userId: reservation.userId,
        productId: reservation.productId,
        reservationId: reservation.id,
        quantity: reservation.quantity,
        totalPrice:
          reservation.quantity * Number(reservation.product.price),
      },
    });

    this.logger.info({
      event: 'ORDER_CREATED',
      orderId: order.id,
    });

    // -----------------------------
    // 6. Mark reservation as COMPLETED
    // -----------------------------
    await tx.reservation.update({
      where: { id: reservation.id },
      data: {
        status: ReservationStatus.COMPLETED,
      },
    });

    // -----------------------------
    // 7. Inventory Log
    // -----------------------------
    await tx.inventoryLog.create({
      data: {
        productId: reservation.productId,
        action: InventoryAction.PURCHASE,
        quantity: reservation.quantity,
        referenceId: order.id,
      },
    });

    this.logger.info({
      event: 'CHECKOUT_SUCCESS',
      orderId: order.id,
    });
    // -----------------------------
    // 8. Response
    // -----------------------------
    return {
      orderId: order.id,
      message: 'Checkout successful',
    };
  });
  }
}
