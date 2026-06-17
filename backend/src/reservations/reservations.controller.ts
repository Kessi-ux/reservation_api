import { Body, Controller, Post } from '@nestjs/common';
import { ReservationsService } from './reservations.service';

@Controller()
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
  ) {}

  @Post('reserve')
  reserve(@Body() body: any) {
    return this.reservationsService.reserve(body);
  }
}
