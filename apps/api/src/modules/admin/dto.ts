import { IsIn } from 'class-validator';
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

export class SetRoleDto {
  @IsIn(USER_ROLES, {
    message: `role must be one of: ${USER_ROLES.join(', ')}`,
  })
  role: UserRole;
}
