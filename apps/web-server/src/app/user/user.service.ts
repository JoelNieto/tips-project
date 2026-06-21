import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import { auth } from '../auth/auth';
import type { AuthUserContext } from '../auth/auth-policy.service';
import { AuthPolicyService } from '../auth/auth-policy.service';
import type { CreateUserInput } from './dto/create-user.input';
import type { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authPolicy: AuthPolicyService
  ) {}

  async findAll(actor: AuthUserContext) {
    this.authPolicy.assertRole(actor, [UserRole.ADMIN]);

    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        organizationMemberships: { include: { organization: true } },
        employeeProfile: { include: { company: true } },
      },
    });
  }

  async findOne(id: string, actor: AuthUserContext) {
    this.authPolicy.assertRole(actor, [UserRole.ADMIN]);

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        organizationMemberships: { include: { organization: true } },
        employeeProfile: { include: { company: true } },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async create(input: CreateUserInput, actor: AuthUserContext) {
    this.authPolicy.assertRole(actor, [UserRole.ADMIN]);

    if (
      (input.role === UserRole.ORG_ADMIN || input.role === UserRole.EMPLOYEE) &&
      !input.organizationId
    ) {
      throw new BadRequestException(
        'Organization is required for ORG_ADMIN and EMPLOYEE roles'
      );
    }

    if (input.role === UserRole.EMPLOYEE && !input.employeeId) {
      throw new BadRequestException(
        'Employee record is required for EMPLOYEE role'
      );
    }

    if (input.employeeId) {
      const employee = await this.prisma.employee.findUnique({
        where: { id: input.employeeId },
        include: { company: true },
      });
      if (!employee) {
        throw new NotFoundException(
          `Employee with id ${input.employeeId} not found`
        );
      }
      if (employee.userId) {
        throw new BadRequestException('Employee is already linked to a user');
      }
      if (
        input.organizationId &&
        employee.company.organizationId !== input.organizationId
      ) {
        throw new BadRequestException(
          'Employee must belong to a company in the selected organization'
        );
      }
    }

    const result = (await auth.api.createUser({
      body: {
        email: input.email,
        password: input.password,
        name: input.name,
        role: input.role,
        data: {
          locale: input.locale ?? 'en',
          role: input.role,
        },
      },
    } as never)) as { user?: { id?: string } } | null;

    if (!result?.user?.id) {
      throw new BadRequestException('Failed to create user');
    }

    const userId = result.user.id;

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { role: input.role, locale: input.locale ?? 'en' },
      });

      if (input.organizationId) {
        await tx.organizationUser.create({
          data: {
            organizationId: input.organizationId,
            userId,
          },
        });
      }

      if (input.employeeId) {
        await tx.employee.update({
          where: { id: input.employeeId },
          data: { userId },
        });
      }

      return tx.user.findUniqueOrThrow({
        where: { id: userId },
        include: {
          organizationMemberships: { include: { organization: true } },
          employeeProfile: { include: { company: true } },
        },
      });
    });
  }

  async update(id: string, input: UpdateUserInput, actor: AuthUserContext) {
    this.authPolicy.assertRole(actor, [UserRole.ADMIN]);

    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (existing.role === UserRole.ADMIN && input.role && input.role !== UserRole.ADMIN) {
      const adminCount = await this.prisma.user.count({
        where: { role: UserRole.ADMIN },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot remove the last admin user');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      if (input.role) {
        await tx.user.update({
          where: { id },
          data: { role: input.role },
        });
      }

      if (input.organizationId !== undefined) {
        await tx.organizationUser.deleteMany({ where: { userId: id } });
        if (input.organizationId) {
          await tx.organizationUser.create({
            data: { organizationId: input.organizationId, userId: id },
          });
        }
      }

      if (input.employeeId !== undefined) {
        await tx.employee.updateMany({
          where: { userId: id },
          data: { userId: null },
        });
        if (input.employeeId) {
          const employee = await tx.employee.findUnique({
            where: { id: input.employeeId },
          });
          if (!employee) {
            throw new NotFoundException(
              `Employee with id ${input.employeeId} not found`
            );
          }
          if (employee.userId && employee.userId !== id) {
            throw new BadRequestException(
              'Employee is already linked to another user'
            );
          }
          await tx.employee.update({
            where: { id: input.employeeId },
            data: { userId: id },
          });
        }
      }

      return tx.user.findUniqueOrThrow({
        where: { id },
        include: {
          organizationMemberships: { include: { organization: true } },
          employeeProfile: { include: { company: true } },
        },
      });
    });
  }
}
