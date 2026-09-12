import { IsIn, IsOptional } from 'class-validator';
import { PaginationQuery } from '../../common/dto/pagination.dto';
import type { UserRole } from '../../common/types/auth.types';

// Kept in step with the user_role enum in db/schema.sql and the UserRole union
// in common/types/auth.types.ts. All three list the same five, in the same order.
export const USER_ROLES: UserRole[] = [
  'customer',
  'shop_owner',
  'shop_staff',
  'courier',
  'admin',
];

// Every value the licence_status enum in apps/api/prisma/schema.prisma can
// hold, for filtering. The narrower set a reviewer may WRITE lives in
// shops/dto.ts as REVIEWED_LICENCE_STATUSES — they are not the same list.
export const LICENCE_STATUSES = [
  'none',
  'pending',
  'verified',
  'rejected',
  'expired',
] as const;

export class SetRoleDto {
  @IsIn(USER_ROLES, {
    message: `role must be one of: ${USER_ROLES.join(', ')}`,
  })
  role: UserRole;
}

/**
 * Queue filters. Both default to what an operator opened the console to do —
 * the applications nobody has looked at yet — rather than to "everything".
 */
export class ListCourierQueueQuery extends PaginationQuery {
  /**
   * `pending` is `is_verified = false`, and so is `rejected`: the column is a
   * boolean. The queue therefore re-shows an application an operator has
   * already turned down, which is a known consequence of the boolean and is
   * tracked with the enum change in docs/API_CONTRACT.md § 8.
   */
  @IsOptional()
  @IsIn(['pending', 'verified', 'all'])
  status: 'pending' | 'verified' | 'all' = 'pending';
}

export class ListLicenceQueueQuery extends PaginationQuery {
  @IsOptional()
  @IsIn([...LICENCE_STATUSES, 'all'])
  licence_status: (typeof LICENCE_STATUSES)[number] | 'all' = 'pending';
}
