
import { User, UserRole } from './types';

export const ADMIN_USER: User = {
  id: 'admin-001',
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'adminpassword',
  role: UserRole.ADMIN,
};
