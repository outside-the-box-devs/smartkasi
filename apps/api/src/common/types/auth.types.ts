export type UserRole =
  'customer' | 'shop_owner' | 'shop_staff' | 'courier' | 'admin';

export interface AuthUser {
  id: string;
  email?: string;
  role: UserRole;
}

declare module 'express' {
  interface Request {
    user?: AuthUser;
  }
}
