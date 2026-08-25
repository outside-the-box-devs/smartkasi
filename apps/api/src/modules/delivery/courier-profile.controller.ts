import { Body, Controller, Get, HttpCode, Patch, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth.types';
import { CourierProfileService } from './courier-profile.service';
import { ApplyCourierDto, UpdateCourierDto } from './dto';

/**
 * Courier onboarding and availability. Sits on the same `/courier` prefix as
 * CourierController but is a separate class on purpose: that one carries a
 * class-level `@Roles('courier')` because every response it returns contains a
 * customer's address and phone number, and these routes must NOT inherit it.
 *
 * Applying is what makes someone a courier, so requiring the courier role to
 * apply would be a closed loop — and even the routes that do assume an existing
 * courier are gated on the `couriers` row rather than the role claim, because
 * the claim is a token old, not a database read. See CourierProfileService for
 * the full reasoning.
 */
@Controller('courier')
export class CourierProfileController {
  constructor(private readonly service: CourierProfileService) {}

  /**
   * 202, matching POST /shops/{id}/licence: the application is accepted for
   * review, not granted. A 201 here would read as "you are a courier now".
   */
  @Post('application')
  @HttpCode(202)
  apply(@CurrentUser() user: AuthUser, @Body() dto: ApplyCourierDto) {
    return this.service.apply(user, dto);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.service.get(user);
  }

  @Patch('me')
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateCourierDto) {
    return this.service.update(user, dto);
  }

  /**
   * Two routes rather than one PATCH with a boolean. This is a toggle in a
   * courier's hand on a bad connection: both are idempotent, neither carries a
   * body that can be malformed, and a retry cannot flip the state back.
   */
  @Post('online')
  @HttpCode(200)
  goOnline(@CurrentUser() user: AuthUser) {
    return this.service.setAvailability(user, true);
  }

  @Post('offline')
  @HttpCode(200)
  goOffline(@CurrentUser() user: AuthUser) {
    return this.service.setAvailability(user, false);
  }
}
