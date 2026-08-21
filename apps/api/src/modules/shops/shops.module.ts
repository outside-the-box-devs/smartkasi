import { Module } from '@nestjs/common';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';
import { ShopAccessService } from './shop-access.service';

@Module({
  controllers: [ShopsController],
  providers: [ShopsService, ShopAccessService],
  exports: [ShopAccessService, ShopsService],
})
export class ShopsModule {}
