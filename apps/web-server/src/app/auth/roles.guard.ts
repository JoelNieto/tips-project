import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { UserRole } from '@generated/prisma';
import { AuthPolicyService } from './auth-policy.service';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authPolicy: AuthPolicyService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context);
    const req = gqlContext.getContext()?.req;
    const session = req?.session as { user?: { id?: string } } | undefined;

    if (!session?.user?.id) {
      throw new ForbiddenException('Authentication required');
    }

    const user = await this.authPolicy.getUserContext(session.user.id);
    this.authPolicy.assertRole(user, requiredRoles);

    gqlContext.getContext().authUser = user;
    return true;
  }
}
