import { Module } from '@nestjs/common';

import { CourierController } from './courier.controller';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';

/**
 * Courier dispatch and delivery tracking. Replaces the v1 delivery stub — the
 * routes, status codes and response shapes are unchanged; the values are now
 * real. See delivery.presenter.ts for the customer/courier privacy split.
 */
@Module({
  controllers: [DeliveryController, CourierController],
  providers: [DeliveryService],
})
export class DeliveryModule {}
