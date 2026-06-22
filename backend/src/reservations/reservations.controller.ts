import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
  ) {}

  // =====================================================
  // RESERVE ENDPOINT
  // =====================================================
  @UseGuards(JwtAuthGuard)
  @Post('reserve')
  @ApiOperation({
    summary: 'Reserve a product',
    description:
      'Creates a temporary stock reservation (locks inventory for a limited time)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user-1' },
        productId: { type: 'string', example: 'prod-1' },
        quantity: { type: 'number', example: 2 },
      },
      required: ['userId', 'productId', 'quantity'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Reservation created successfully',
    schema: {
      example: {
        reservationId: 'uuid-here',
        expiresAt: '2026-01-01T12:00:00.000Z',
        message: 'Product reserved successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient stock or invalid request',
  })
  reserve(@Body() body: any) {
    return this.reservationsService.reserve(body);
  }

  // =====================================================
  // CHECKOUT ENDPOINT
  // =====================================================
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  @ApiOperation({
    summary: 'Checkout a reservation',
    description:
      'Converts an active reservation into a confirmed order',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reservationId: {
          type: 'string',
          example: 'c2f1a9b2-7c2e-4c1a-9f1a-123456789abc',
        },
      },
      required: ['reservationId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Checkout successful',
    schema: {
      example: {
        orderId: '9f2c1b3a-1234-4567-89ab-abcdef123456',
        message: 'Checkout successful',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid, expired, or inactive reservation',
    schema: {
      example: {
        statusCode: 400,
        message: 'Reservation expired',
        error: 'Bad Request',
      },
    },
  })
  checkout(@Body() body: any) {
    return this.reservationsService.checkout(body);
  }
}
