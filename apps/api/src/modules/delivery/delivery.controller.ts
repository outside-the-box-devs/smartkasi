import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth.types';
import { DeliveryService } from './delivery.service';
import { RequestDeliveryDto } from './dto';

/**
 * Customer-facing delivery routes. Both return `CustomerDelivery` — the shape
 * with no coordinates, no route and no courier contact details.
 */
@Controller()
export class DeliveryController {
  constructor(private readonly service: DeliveryService) {}

  @Post('orders/:orderId/delivery')
  @HttpCode(202)
  request(
    @CurrentUser() user: AuthUser,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: RequestDeliveryDto,
  ) {
    return this.service.request(user, orderId, dto);
  }

  @Get('deliveries/:deliveryId')
  track(
    @CurrentUser() user: AuthUser,
    @Param('deliveryId', ParseUUIDPipe) deliveryId: string,
  ) {
    return this.service.track(user, deliveryId);
  }
}
