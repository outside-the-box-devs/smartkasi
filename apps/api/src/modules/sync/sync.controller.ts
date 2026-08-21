import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { IsDateString, IsOptional } from 'class-validator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth.types';
import { SyncService } from './sync.service';

class SyncQuery {
  @IsOptional() @IsDateString() since?: string;
}

@Controller('shops/:shopId/sync')
export class SyncController {
  constructor(private readonly service: SyncService) {}

  @Get()
  pull(
    @CurrentUser() user: AuthUser,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Query() query: SyncQuery,
  ) {
    return this.service.pull(user, shopId, query.since);
  }
}
