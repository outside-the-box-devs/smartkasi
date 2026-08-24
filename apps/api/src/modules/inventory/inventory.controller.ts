import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth.types';
import {
  AddInventoryItemDto,
  BulkUpsertInventoryDto,
  ListInventoryQuery,
  UpdateInventoryItemDto,
} from './dto';
import { InventoryService } from './inventory.service';

@Controller('shops/:shopId/inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Query() query: ListInventoryQuery,
  ) {
    return this.service.list(user, shopId, query);
  }

  @Get('low-stock')
  lowStock(
    @CurrentUser() user: AuthUser,
    @Param('shopId', ParseUUIDPipe) shopId: string,
  ) {
    return this.service.lowStock(user, shopId);
  }

  @Post()
  add(
    @CurrentUser() user: AuthUser,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Body() dto: AddInventoryItemDto,
  ) {
    return this.service.add(user, shopId, dto);
  }

  @Post('bulk-upsert')
  @HttpCode(207)
  bulkUpsert(
    @CurrentUser() user: AuthUser,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Body() dto: BulkUpsertInventoryDto,
  ) {
    return this.service.bulkUpsert(user, shopId, dto);
  }

  @Patch(':shopProductId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Param('shopProductId', ParseUUIDPipe) shopProductId: string,
    @Body() dto: UpdateInventoryItemDto,
  ) {
    return this.service.update(user, shopId, shopProductId, dto);
  }
}
