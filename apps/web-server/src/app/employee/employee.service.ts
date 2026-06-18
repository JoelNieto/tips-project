import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Employee, Prisma } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import type { CreateEmployeeInput } from './dto/create-employee.input';
import type { UpdateEmployeeInput } from './dto/update-employee.input';

type EmployeeWithPosition = Prisma.EmployeeGetPayload<{
  include: { position: true };
}>;

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCompany(companyId: string): Promise<EmployeeWithPosition[]> {
    await this.ensureCompanyExists(companyId);

    return this.prisma.employee.findMany({
      where: { companyId },
      include: { position: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async findOne(id: string): Promise<EmployeeWithPosition | null> {
    return this.prisma.employee.findUnique({
      where: { id },
      include: { position: true },
    });
  }

  async create(input: CreateEmployeeInput): Promise<EmployeeWithPosition> {
    await this.ensureCompanyExists(input.companyId);

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
    input: UpdateEmployeeInput
  ): Promise<EmployeeWithPosition> {
    const existing = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

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

  async delete(id: string): Promise<Employee> {
    const existing = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    return this.prisma.employee.delete({
      where: { id },
    });
  }

  private async ensureCompanyExists(companyId: string): Promise<void> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with id ${companyId} not found`);
    }
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
