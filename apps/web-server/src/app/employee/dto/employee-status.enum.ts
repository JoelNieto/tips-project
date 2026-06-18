import { registerEnumType } from '@nestjs/graphql';
import { EmployeeStatus } from '@generated/prisma';

export { EmployeeStatus };

registerEnumType(EmployeeStatus, {
  name: 'EmployeeStatus',
});
