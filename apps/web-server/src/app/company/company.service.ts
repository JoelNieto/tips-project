import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Company, Prisma, User } from '@generated/prisma';
import { UserRole } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import type { AuthUserContext } from '../auth/auth-policy.service';
import { AuthPolicyService } from '../auth/auth-policy.service';
import type { CreateCompanyInput } from './dto/create-company.input';
import type { UpdateCompanyInput } from './dto/update-company.input';

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authPolicy: AuthPolicyService
  ) {}

  async findAll(user: AuthUserContext): Promise<Company[]> {
    this.authPolicy.denyOrgDataAccess(user);

    const where: Prisma.CompanyWhereInput = {};

    if (this.authPolicy.isOrgAdmin(user)) {
      where.organizationId = { in: this.authPolicy.getOrganizationIds(user) };
    }

    return this.prisma.company.findMany({
      where,
      include: { createdBy: true, organization: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: AuthUserContext) {
    await this.authPolicy.assertCompanyAccess(user, id);
    return this.prisma.company.findUnique({
      where: { id },
      include: { createdBy: true, organization: true },
    });
  }

  async create(input: CreateCompanyInput, user: AuthUserContext) {
    this.authPolicy.assertRole(user, [UserRole.ADMIN]);
    await this.authPolicy.assertOrganizationAccess(user, input.organizationId);

    return this.prisma.company.create({
      data: {
        ...input,
        createdById: user.id,
      },
      include: { createdBy: true, organization: true },
    });
  }

  async update(
    id: string,
    input: UpdateCompanyInput,
    user: AuthUserContext
  ): Promise<Company & { createdBy: User }> {
    await this.authPolicy.assertCompanyAccess(user, id);

    if (this.authPolicy.isOrgAdmin(user)) {
      this.authPolicy.assertRole(user, [UserRole.ORG_ADMIN]);
    }

    return this.prisma.company.update({
      where: { id },
      data: input,
      include: { createdBy: true, organization: true },
    });
  }

  async delete(id: string, user: AuthUserContext): Promise<Company> {
    this.authPolicy.assertRole(user, [UserRole.ADMIN]);
    await this.findOne(id, user);

    return this.prisma.company.delete({
      where: { id },
    });
  }
}
