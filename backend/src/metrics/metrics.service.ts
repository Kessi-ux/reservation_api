import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  async getMetrics() {
    const orders = await this.prisma.order.count();

    const reservations = await this.prisma.reservation.count();

    return {
      // seconds since app started
      uptime: Math.floor(process.uptime()),

      orders,

      reservations,
    };
  }
}
