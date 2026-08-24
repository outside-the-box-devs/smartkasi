import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth.types';
import {
  CreateFlyerDto,
  FlyersService,
  ListFlyersQuery,
} from './flyers.service';

@Controller('shops/:shopId/flyers')
export class FlyersController {
  constructor(private readonly service: FlyersService) {}

  @Public()
  @Get()
  list(
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Query() query: ListFlyersQuery,
  ) {
    return this.service.list(shopId, query);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Body() dto: CreateFlyerDto,
  ) {
    return this.service.create(user, shopId, dto);
  }

  @Delete(':flyerId')
  @HttpCode(204)
  remove(
    @CurrentUser() user: AuthUser,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Param('flyerId', ParseUUIDPipe) flyerId: string,
  ) {
    return this.service.remove(user, shopId, flyerId);
  }
}
