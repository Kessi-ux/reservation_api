import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { ReservationExpirationService } from './reservation-expiration.service';

@Module({
  providers: [ReservationsService, ReservationExpirationService],
  controllers: [ReservationsController]
})
export class ReservationsModule {}
