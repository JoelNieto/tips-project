import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { EmployeeResolver } from './employee.resolver';
import { EmployeeService } from './employee.service';

@Module({
  imports: [PrismaModule],
  providers: [EmployeeResolver, EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
