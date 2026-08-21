import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { IsUUID } from 'class-validator';

class PaymentIntentDto {
  @IsUUID() order_id: string;
}

/**
 * STUB — v1 is cash on delivery / cash at till. Yoco is not wired.
 *
 * Returns `not_implemented` with a null checkout_url ON PURPOSE, so client code
 * can branch on it today without ever pretending a payment succeeded. Do not
 * make this return a fake success.
 */
@Controller('payments')
export class PaymentsStubController {
  @Post('intent')
  @HttpCode(200)
  intent(@Body() _dto: PaymentIntentDto) {
    return {
      status: 'not_implemented',
      checkout_url: null,
      message: 'v1 is cash only. Collect payment on handover.',
      _stub: true,
    };
  }
}
