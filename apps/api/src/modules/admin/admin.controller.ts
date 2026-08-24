import { Body, Controller, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { SetRoleDto } from './dto';

@Controller('admin')
@Roles('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Patch('users/:userId/role')
  setRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: SetRoleDto,
  ) {
    return this.service.setRole(userId, dto);
  }
}
