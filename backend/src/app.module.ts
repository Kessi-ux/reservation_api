import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { ReservationsModule } from './reservations/reservations.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { MetricsModule } from './metrics/metrics.module';
import { HealthController } from './health/health.controller';
import { HealthModule } from './health/health.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
          },
        },
        level: 'info',
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    ProductsModule,
    ReservationsModule,
    OrdersModule,
    AuthModule,
    MetricsModule,
    MetricsModule,
    HealthModule,
    AuthModule,
    ThrottlerModule.forRoot([
      {
        ttl: 900, // 15 minutes (in seconds)
        limit: 100, // max requests per ttl
      },
    ]),
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
