import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { VerifyCourierDto } from '../delivery/dto';
import { SetLicenceStatusDto } from '../shops/dto';
import { AdminService } from './admin.service';
import {
  ListCourierQueueQuery,
  ListLicenceQueueQuery,
  SetRoleDto,
} from './dto';

/**
 * The operator console's API. One class-level `@Roles('admin')` is the entire
 * authorisation story for everything below it — no route here re-checks, so
 * nothing may be added to this controller that a platform operator should not
 * be able to do.
 *
 * The verification routes are the missing half of two features that already
 * shipped their submission half: a courier could apply and nothing could
 * approve them, and a shop could submit a trading licence and nothing could act
 * on it. See docs/API_CONTRACT.md § 9.3.
 */
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

  /**
   * The review queue. A verify endpoint keyed on a uuid is unusable without
   * something that hands out the uuids — there is no other listing of couriers
   * anywhere in the API.
   */
  @Get('couriers')
  listCouriers(@Query() query: ListCourierQueueQuery) {
    return this.service.listCouriers(query);
  }

  @Patch('couriers/:courierId/verify')
  verifyCourier(
    @Param('courierId', ParseUUIDPipe) courierId: string,
    @Body() dto: VerifyCourierDto,
  ) {
    return this.service.verifyCourier(courierId, dto);
  }

  /**
   * Deliberately not a filter on `GET /shops`: that is the public township
   * directory, and which shops are awaiting or have failed review is not a
   * thing to answer for anyone who asks.
   */
  @Get('shops')
  listShops(@Query() query: ListLicenceQueueQuery) {
    return this.service.listShops(query);
  }

  @Patch('shops/:shopId/licence')
  setLicenceStatus(
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Body() dto: SetLicenceStatusDto,
  ) {
    return this.service.setLicenceStatus(shopId, dto);
  }
}
