import { Global, Module } from '@nestjs/common';
import { AuthPolicyService } from './auth-policy.service';
import { RolesGuard } from './roles.guard';
import { PrismaModule } from '../prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [AuthPolicyService, RolesGuard],
  exports: [AuthPolicyService, RolesGuard],
})
export class AuthCoreModule {}
