import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DeliveryModule } from '../delivery/delivery.module';
import { ShopsModule } from '../shops/shops.module';

/**
 * Imports the two domain modules rather than reimplementing their writes: the
 * rules about what verifying a courier or a trading licence means live with
 * those records, and this module supplies only the admin-gated way in.
 */
@Module({
  imports: [DeliveryModule, ShopsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
