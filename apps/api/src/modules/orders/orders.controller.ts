import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, HttpCode } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth.types';
import {
  AcceptLegDto, CancelOrderDto, CreateOrderDto, ListOrdersQuery, QuoteRequestDto, RejectLegDto,
} from './dto';
import { OrdersService } from './orders.service';
import { QuoteService } from './quote.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly service: OrdersService,
    private readonly quotes: QuoteService,
  ) {}

  @Post('quote')
  @HttpCode(200)
  quote(@CurrentUser() user: AuthUser, @Body() dto: QuoteRequestDto) {
    return this.quotes.quote(user.id, dto);
  }

  @Get()
  listMine(@CurrentUser() user: AuthUser, @Query() query: ListOrdersQuery) {
    return this.service.listMine(user, query);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.service.create(user, dto);
  }

  @Get(':orderId')
  get(@CurrentUser() user: AuthUser, @Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.service.get(user, orderId);
  }

  @Post(':orderId/cancel')
  @HttpCode(200)
  cancel(
    @CurrentUser() user: AuthUser,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.service.cancel(user, orderId, dto);
  }

  @Post(':orderId/legs/:shopId/accept')
  @HttpCode(200)
  accept(
    @CurrentUser() user: AuthUser,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Body() dto: AcceptLegDto,
  ) {
    return this.service.acceptLeg(user, orderId, shopId, dto);
  }

  @Post(':orderId/legs/:shopId/reject')
  @HttpCode(200)
  reject(
    @CurrentUser() user: AuthUser,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Body() dto: RejectLegDto,
  ) {
    return this.service.rejectLeg(user, orderId, shopId, dto);
  }

  @Post(':orderId/legs/:shopId/ready')
  @HttpCode(200)
  ready(
    @CurrentUser() user: AuthUser,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Param('shopId', ParseUUIDPipe) shopId: string,
  ) {
    return this.service.readyLeg(user, orderId, shopId);
  }
}
