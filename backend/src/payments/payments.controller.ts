import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  BadRequestException,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import { InitiatePaymentDto } from './dto/initiate-payment.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentService: PaymentsService) {}

  /**
   * =====================================================
   * INITIATE PAYMENT
   * =====================================================
   */
  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Initiate Paystack payment',
    description:
      'Initializes a Paystack payment for an authenticated user and returns the Paystack authorization URL.',
  })
  @ApiBody({
  type: InitiatePaymentDto,
})
  @ApiResponse({
    status: 201,
    description: 'Payment initialized successfully.',
    schema: {
      example: {
        authorization_url:
          'https://checkout.paystack.com/abcd1234',
        access_code: 'ACCESS_xxxxxxxxx',
        reference:
          'RES_7b57d44b-cbe4-4db8-ae18-6d3f0e3eb4c2_1782412345678',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Reservation not found or inactive.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  initiate(
  @Body() body: InitiatePaymentDto,
  @Req() req: any,
) {
  const userId = req.user.userId;

  return this.paymentService.initiatePayment(
    body.reservationIds,
    userId,
  );
}

  /**
   * =====================================================
   * PAYSTACK WEBHOOK
   * =====================================================
   */
  @Post('webhook')
  @ApiOperation({
    summary: 'Paystack webhook',
    description:
      'Receives payment events from Paystack and confirms successful payments.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully.',
    schema: {
      example: {
        status: 'success',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature.',
  })
  async handleWebhook(
    @Req() req: Request & { rawBody?: string },
    @Headers('x-paystack-signature') signature: string,
  ) {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    const rawBody = req.rawBody || JSON.stringify(req.body);

    const hash = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      throw new BadRequestException('Invalid signature');
    }

    const event = req.body;

    if (event.event === 'charge.success') {
      const reference = event.data.reference;

      if (!reference) {
        throw new BadRequestException(
          'Missing payment reference in webhook',
        );
      }

      await this.paymentService.confirmPayment(reference);

      return {
        status: 'success',
      };
    }

    return {
      status: 'ignored',
      event: event.event,
    };
  }

  @ApiOperation({
    summary: 'Get payment status',
    description:
      'Retrieves the current status of a payment using its Paystack reference. This endpoint is intended for the frontend to determine whether a payment has been processed by the webhook.',
  })
  @ApiParam({
    name: 'reference',
    description: 'Unique Paystack payment reference',
    example: 'INV_3JX9LQK4T2',
  })
  @ApiOkResponse({
    description: 'Payment status retrieved successfully.',
    schema: {
      example: {
        status: 'SUCCESS',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Payment not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Payment not found',
        error: 'Not Found',
      },
    },
  })
  @Get('status/:reference')
  getPaymentStatus(
    @Param('reference') reference: string,
  ) {
    return this.paymentService.getPaymentStatus(reference);
  }
}
