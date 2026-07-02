import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { Get, Param } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * =====================================================
   * INITIATE PAYMENT
   * =====================================================
   */
  async initiatePayment(
    reservationIds: string[],
    userId: string,
  ) {
    const reservations =
      await this.prisma.reservation.findMany({
        where: {
          id: {
            in: reservationIds,
          },
        },
        include: {
          user: true,
          product: true,
        },
      });

    if (reservations.length !== reservationIds.length) {
      throw new BadRequestException(
        'One or more reservations were not found',
      );
    }

    for (const reservation of reservations) {
      if (reservation.userId !== userId) {
        throw new BadRequestException(
          'Unauthorized reservation access',
        );
      }

      if (reservation.status !== 'ACTIVE') {
        throw new BadRequestException(
          `Reservation ${reservation.id} is not active`,
        );
      }

      if (reservation.orderId) {
        throw new BadRequestException(
          `Reservation ${reservation.id} already belongs to an order`,
        );
      }
    }

    const email = reservations[0].user.email;

    const amount =
      reservations.reduce(
        (sum, reservation) =>
          sum +
          Number(reservation.product.price) *
            reservation.quantity,
        0,
      ) * 100;

    const reference = `PAY_${Date.now()}`;

    // Create order and payment first
    const order = await this.prisma.$transaction(
      async (tx) => {
        const order = await tx.order.create({
          data: {
            userId,
            totalPrice: amount / 100,
          },
        });

        await tx.reservation.updateMany({
          where: {
            id: {
              in: reservationIds,
            },
          },
          data: {
            orderId: order.id,
          },
        });

        await tx.payment.create({
          data: {
            reference,
            amount,
            email,
            orderId: order.id,
            status: 'PENDING',
          },
        });

        return order;
      },
    );

    // Initialize Paystack AFTER transaction
    try {
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
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    return response.data.data;
  } catch (error) {
      console.error('Paystack initialization failed');
      console.error(error.response?.data);
      console.error(error.message);

      await this.prisma.payment.update({
        where: {
          reference,
        },
        data: {
          status: 'FAILED',
        },
      });

      throw new BadRequestException(
        'Unable to initialize payment. Please try again.'
      );
    }
  }

  /**
   * =====================================================
   * CONFIRM PAYMENT (WEBHOOK)
   * =====================================================
   */
  async confirmPayment(reference: string) {
    const payment =
      await this.prisma.payment.findUnique({
        where: {
          reference,
        },
        include: {
          order: {
            include: {
              reservations: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

    if (!payment) {
      return;
    }

    // Already processed
    if (payment.status === 'SUCCESS') {
      return payment.order;
    }

    if (!payment.orderId || !payment.order) {
      throw new BadRequestException(
        'Payment is not linked to an order',
      );
    }

    const orderId = payment.orderId;
    const order = payment.order;

    return this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: 'SUCCESS',
        },
      });

      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: 'PAID',
        },
      });

      for (const reservation of order.reservations)  {
        await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: 'COMPLETED',
          },
        });

        await tx.inventoryLog.create({
          data: {
            productId: reservation.productId,
            action: 'PURCHASE',
            quantity: reservation.quantity,
            referenceId: orderId,
          },
        });
      }

      return tx.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          reservations: true,
          payments: true,
        },
      });
    });
  }

  /**
   * =====================================================
   * GET PAYMENT STATUS
   * =====================================================
   */
  async getPaymentStatus(reference: string) {
    const payment = await this.prisma.payment.findUnique({
      where: {
        reference,
      },
      select: {
        status: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}
