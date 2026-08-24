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
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthUser } from '../../common/types/auth.types';
import { DeliveryService } from './delivery.service';
import { CollectJobDto, DeliverJobDto } from './dto';

/**
 * Courier-app routes. Every response here is `CourierDelivery`, which carries
 * pickup addresses and the customer's phone number — the role gate on this
 * controller is the only thing keeping that off a customer's device.
 */
@Controller('courier')
@Roles('courier')
export class CourierController {
  constructor(private readonly service: DeliveryService) {}

  @Get('jobs')
  jobs(@CurrentUser() user: AuthUser) {
    return this.service.jobs(user);
  }

  @Post('jobs/:deliveryId/accept')
  @HttpCode(200)
  accept(
    @CurrentUser() user: AuthUser,
    @Param('deliveryId', ParseUUIDPipe) deliveryId: string,
  ) {
    return this.service.accept(user, deliveryId);
  }

  @Post('jobs/:deliveryId/collect')
  @HttpCode(200)
  collect(
    @CurrentUser() user: AuthUser,
    @Param('deliveryId', ParseUUIDPipe) deliveryId: string,
    @Body() dto: CollectJobDto,
  ) {
    return this.service.collect(user, deliveryId, dto);
  }

  @Post('jobs/:deliveryId/deliver')
  @HttpCode(200)
  deliver(
    @CurrentUser() user: AuthUser,
    @Param('deliveryId', ParseUUIDPipe) deliveryId: string,
    @Body() dto: DeliverJobDto,
  ) {
    return this.service.deliver(user, deliveryId, dto);
  }
}
