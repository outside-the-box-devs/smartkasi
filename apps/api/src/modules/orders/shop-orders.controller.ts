import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth.types';
import { ListOrdersQuery } from './dto';
import { OrdersService } from './orders.service';

@Controller('shops/:shopId/orders')
export class ShopOrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Query() query: ListOrdersQuery,
  ) {
    return this.service.listForShop(user, shopId, query);
  }
}
