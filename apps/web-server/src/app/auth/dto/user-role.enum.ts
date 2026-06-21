import { registerEnumType } from '@nestjs/graphql';
import { UserRole } from '@generated/prisma';

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'Platform user role',
});

export { UserRole };
