import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ReservationsService } from './reservations.service';
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
  @Post('reserve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reserve a product',
    description:
      'Creates a temporary reservation for the authenticated user.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          format: 'uuid',
          example: '2736ba17-4f5f-4b7f-9ccf-eab127791384',
        },
        quantity: {
          type: 'integer',
          example: 2,
        },
      },
      required: ['productId', 'quantity'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Reservation created successfully',
    schema: {
      example: {
        reservationId: '7b57d44b-cbe4-4db8-ae18-6d3f0e3eb4c2',
        expiresAt: '2026-06-25T17:30:00.000Z',
        status: 'ACTIVE',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient stock or invalid request',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  reserve(
    @Req() req: Request & { user: any },
    @Body() body: any,
  ) {
    return this.reservationsService.reserve(
      req.user.userId,
      body.productId,
      body.quantity,
    );
  }
}
