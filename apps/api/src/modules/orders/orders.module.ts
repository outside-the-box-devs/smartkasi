import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { ShopOrdersController } from './shop-orders.controller';
import { OrdersService } from './orders.service';
import { QuoteService } from './quote.service';
import { ShopsModule } from '../shops/shops.module';

@Module({
  imports: [ShopsModule],
  controllers: [OrdersController, ShopOrdersController],
  providers: [OrdersService, QuoteService],
})
export class OrdersModule {}
