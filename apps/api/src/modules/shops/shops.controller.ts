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
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth.types';
import {
  CreateShopDto,
  ListShopsQuery,
  SubmitLicenceDto,
  UpdateShopDto,
} from './dto';
import { ShopsService } from './shops.service';

@Controller('shops')
export class ShopsController {
  constructor(private readonly service: ShopsService) {}

  @Public()
  @Get()
  list(@CurrentUser() user: AuthUser | undefined, @Query() query: ListShopsQuery) {
    return this.service.list(query, user);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateShopDto) {
    return this.service.create(user, dto);
  }

  @Public()
  @Get(':shopId')
  get(@Param('shopId', ParseUUIDPipe) shopId: string) {
    return this.service.get(shopId);
  }

  @Patch(':shopId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Body() dto: UpdateShopDto,
  ) {
    return this.service.update(user, shopId, dto);
  }

  @Post(':shopId/licence')
  @HttpCode(202)
  submitLicence(
    @CurrentUser() user: AuthUser,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Body() dto: SubmitLicenceDto,
  ) {
    return this.service.submitLicence(user, shopId, dto);
  }
}
