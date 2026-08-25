import { Module } from '@nestjs/common';

import { CourierController } from './courier.controller';
import { CourierProfileController } from './courier-profile.controller';
import { CourierProfileService } from './courier-profile.service';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';

/**
 * Courier dispatch and delivery tracking. Replaces the v1 delivery stub — the
 * routes, status codes and response shapes are unchanged; the values are now
 * real. See delivery.presenter.ts for the customer/courier privacy split.
 *
 * Two courier controllers share the `/courier` prefix and the split is a
 * security boundary, not tidiness: CourierController is role-gated because its
 * responses carry customer addresses, CourierProfileController is not because
 * applying to be a courier cannot require already being one.
 */
@Module({
  controllers: [
    DeliveryController,
    CourierProfileController,
    CourierController,
  ],
  providers: [DeliveryService, CourierProfileService],
})
export class DeliveryModule {}
