import {
  Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Query, Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth.types';
import { BatchSalesDto, CreateSaleDto, DailyReportQuery, ListSalesQuery, VoidSaleDto } from './dto';
import { SalesService } from './sales.service';

@Controller('shops/:shopId')
export class SalesController {
  constructor(private readonly service: SalesService) {}

  @Get('sales')
  list(
    @CurrentUser() user: AuthUser,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Query() query: ListSalesQuery,
  ) {
    return this.service.list(user, shopId, query);
  }

  @Post('sales')
  async create(
    @CurrentUser() user: AuthUser,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Body() dto: CreateSaleDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { duplicate, sale } = await this.service.create(user, shopId, dto);
    // 200 for an idempotent replay, 201 for a new sale. Both are success.
    res.status(duplicate ? 200 : 201);
    return sale;
  }

  @Post('sales/batch')
  @HttpCode(207)
  batch(
    @CurrentUser() user: AuthUser,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Body() dto: BatchSalesDto,
  ) {
    return this.service.batch(user, shopId, dto);
  }

  @Get('reports/daily')
  dailyReport(
    @CurrentUser() user: AuthUser,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Query() query: DailyReportQuery,
  ) {
    return this.service.dailyReport(user, shopId, query);
  }

  @Get('sales/:saleId')
  get(
    @CurrentUser() user: AuthUser,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Param('saleId', ParseUUIDPipe) saleId: string,
  ) {
    return this.service.get(user, shopId, saleId);
  }

  @Post('sales/:saleId/void')
  void(
    @CurrentUser() user: AuthUser,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Param('saleId', ParseUUIDPipe) saleId: string,
    @Body() dto: VoidSaleDto,
  ) {
    return this.service.void(user, shopId, saleId, dto);
  }
}
