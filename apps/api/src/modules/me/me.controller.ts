import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth.types';
import { UpdateMeDto } from './dto';
import { MeService } from './me.service';

@Controller('me')
export class MeController {
  constructor(private readonly service: MeService) {}

  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.service.getOrCreate(user);
  }

  @Patch()
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateMeDto) {
    return this.service.update(user, dto);
  }
}
