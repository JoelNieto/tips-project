import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Employee, Prisma } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import type { AuthUserContext } from '../auth/auth-policy.service';
import { AuthPolicyService } from '../auth/auth-policy.service';
import type { CreateEmployeeInput } from './dto/create-employee.input';
import type { UpdateEmployeeInput } from './dto/update-employee.input';

type EmployeeWithPosition = Prisma.EmployeeGetPayload<{
  include: { position: true };
}>;

@Injectable()
export class EmployeeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authPolicy: AuthPolicyService
  ) {}

  async findByCompany(
    companyId: string,
    user: AuthUserContext
  ): Promise<EmployeeWithPosition[]> {
    await this.authPolicy.assertCompanyAccess(user, companyId);

    return this.prisma.employee.findMany({
      where: { companyId },
      include: { position: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async findOne(id: string, user: AuthUserContext): Promise<EmployeeWithPosition | null> {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { position: true },
    });

    if (!employee) {
      return null;
    }

    await this.authPolicy.assertCompanyAccess(user, employee.companyId);
    return employee;
  }

  async create(
    input: CreateEmployeeInput,
    user: AuthUserContext
  ): Promise<EmployeeWithPosition> {
    await this.authPolicy.assertCompanyAccess(user, input.companyId);

    if (input.positionId) {
      await this.ensurePositionBelongsToCompany(
        input.positionId,
        input.companyId
      );
    }

    return this.prisma.employee.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        documentId: input.documentId,
        gender: input.gender,
        email: input.email,
        birthdate: input.birthdate ? new Date(input.birthdate) : null,
        enrollmentDate: new Date(input.enrollmentDate),
        offDate: input.offDate ? new Date(input.offDate) : null,
        status: input.status,
        companyId: input.companyId,
        positionId: input.positionId ?? null,
      },
      include: { position: true },
    });
  }

  async update(
    id: string,
    input: UpdateEmployeeInput,
    user: AuthUserContext
  ): Promise<EmployeeWithPosition> {
    const existing = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    await this.authPolicy.assertCompanyAccess(user, existing.companyId);

    if (input.positionId) {
      await this.ensurePositionBelongsToCompany(
        input.positionId,
        existing.companyId
      );
    }

    return this.prisma.employee.update({
      where: { id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        documentId: input.documentId,
        gender: input.gender,
        email: input.email,
        birthdate:
          input.birthdate !== undefined
            ? input.birthdate
              ? new Date(input.birthdate)
              : null
            : undefined,
        enrollmentDate: input.enrollmentDate
          ? new Date(input.enrollmentDate)
          : undefined,
        offDate:
          input.offDate !== undefined
            ? input.offDate
              ? new Date(input.offDate)
              : null
            : undefined,
        status: input.status,
        positionId: input.positionId,
      },
      include: { position: true },
    });
  }

  async delete(id: string, user: AuthUserContext): Promise<Employee> {
    const existing = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    await this.authPolicy.assertCompanyAccess(user, existing.companyId);

    return this.prisma.employee.delete({
      where: { id },
    });
  }

  private async ensurePositionBelongsToCompany(
    positionId: string,
    companyId: string
  ): Promise<void> {
    const position = await this.prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      throw new NotFoundException(`Position with id ${positionId} not found`);
    }

    if (position.companyId !== companyId) {
      throw new BadRequestException(
        'Position must belong to the same company as the employee'
      );
    }
  }
}
