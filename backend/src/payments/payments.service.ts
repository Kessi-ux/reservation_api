import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * INITIATE PAYMENT (SECURE)
   */
  async initiatePayment(
    reservationId: string,
    userId: string,
  ) {
    const reservation =
      await this.prisma.reservation.findUnique({
        where: { id: reservationId },
        include: {
          user: true,
          product: true,
        },
      });

    if (!reservation) {
      throw new BadRequestException(
        'Reservation not found',
      );
    }

    if (reservation.userId !== userId) {
      throw new BadRequestException(
        'Unauthorized reservation access',
      );
    }

    if (reservation.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Reservation not active',
      );
    }

    const reference =
      `RES_${reservation.id}_${Date.now()}`;

    const email = reservation.user.email;

    const amount =
      Number(reservation.product.price) *
      reservation.quantity *
      100;

    // store payment (idempotency protection)
    await this.prisma.payment.create({
      data: {
        reference,
        reservationId: reservation.id,
        status: 'PENDING',
        amount,
        email,
      },
    });

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount,
        reference,
        callback_url:
          process.env.PAYSTACK_CALLBACK_URL,
      },
      {
        headers: {
          Authorization:
            `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    return response.data.data;
  }

  /**
   * CONFIRM PAYMENT (WEBHOOK)
   */
  async confirmPayment(reference: string) {
    const payment =
      await this.prisma.payment.findUnique({
        where: { reference },
        include: { reservation: true },
      });

    if (!payment) return;

    // idempotency
    if (payment.status === 'SUCCESS') return;

    const reservation = payment.reservation;

    return this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCESS' },
      });

      const order = await tx.order.create({
        data: {
          userId: reservation.userId,
          productId: reservation.productId,
          reservationId: reservation.id,
          quantity: reservation.quantity,
          totalPrice:
            Number(payment.amount) / 100,
        },
      });

      await tx.reservation.update({
        where: { id: reservation.id },
        data: {
          status: 'COMPLETED',
        },
      });

      await tx.inventoryLog.create({
        data: {
          productId: reservation.productId,
          action: 'PURCHASE',
          quantity: reservation.quantity,
          referenceId: order.id,
        },
      });

      return order;
    });
  }
}
