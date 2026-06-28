import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class InitiatePaymentDto {
  @ApiProperty({
    description: 'Reservation IDs to pay for',
    type: [String],
    format: 'uuid',
    example: [
      '7b57d44b-cbe4-4db8-ae18-6d3f0e3eb4c2',
      '2362470e-8c0f-4c6b-b19e-6d3f0e3eb4c2',
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  reservationIds: string[];
}
