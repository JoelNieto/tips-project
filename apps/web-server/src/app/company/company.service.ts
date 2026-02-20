import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Company, Prisma, User } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import type { CreateCompanyInput } from './dto/create-company.input';
import type { UpdateCompanyInput } from './dto/update-company.input';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(createdById?: string): Promise<Company[]> {
    const where: Prisma.CompanyWhereInput = {};
    if (createdById) {
      where.createdById = createdById;
    }
    return this.prisma.company.findMany({
      where,
      include: { createdBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Company & { createdBy: User } | null> {
    return this.prisma.company.findUnique({
      where: { id },
      include: { createdBy: true },
    });
  }

  async create(input: CreateCompanyInput, createdById: string) {
    return this.prisma.company.create({
      data: {
        ...input,
        createdById,
      },
      include: { createdBy: true },
    });
  }

  async update(
    id: string,
    input: UpdateCompanyInput,
    userId: string
  ): Promise<Company & { createdBy: User }> {
    const existing = await this.prisma.company.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    if (existing.createdById !== userId) {
      throw new ForbiddenException('Only the creator can update this company');
    }
    return this.prisma.company.update({
      where: { id },
      data: input,
      include: { createdBy: true },
    });
  }

  async delete(id: string, userId: string): Promise<Company> {
    const existing = await this.prisma.company.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    if (existing.createdById !== userId) {
      throw new ForbiddenException('Only the creator can delete this company');
    }
    return this.prisma.company.delete({
      where: { id },
    });
  }
}
