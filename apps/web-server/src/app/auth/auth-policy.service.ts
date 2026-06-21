import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Company, Organization, Prisma, User } from '@generated/prisma';
import { UserRole } from '@generated/prisma';
import { PrismaService } from '../prisma.service';

export type AuthUserContext = Prisma.UserGetPayload<{
  include: {
    organizationMemberships: true;
    employeeProfile: { include: { company: true } };
  };
}>;

@Injectable()
export class AuthPolicyService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserContext(userId: string): Promise<AuthUserContext> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizationMemberships: true,
        employeeProfile: { include: { company: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  assertRole(user: Pick<User, 'role'>, roles: UserRole[]): void {
    if (!roles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  isAdmin(user: Pick<User, 'role'>): boolean {
    return user.role === UserRole.ADMIN;
  }

  isDesigner(user: Pick<User, 'role'>): boolean {
    return user.role === UserRole.DESIGNER;
  }

  isOrgAdmin(user: Pick<User, 'role'>): boolean {
    return user.role === UserRole.ORG_ADMIN;
  }

  isEmployee(user: Pick<User, 'role'>): boolean {
    return user.role === UserRole.EMPLOYEE;
  }

  getOrganizationIds(user: AuthUserContext): string[] {
    return user.organizationMemberships.map((m) => m.organizationId);
  }

  async assertOrganizationAccess(
    user: AuthUserContext,
    organizationId: string
  ): Promise<Organization> {
    if (this.isAdmin(user)) {
      const org = await this.prisma.organization.findUnique({
        where: { id: organizationId },
      });
      if (!org) {
        throw new NotFoundException(
          `Organization with id ${organizationId} not found`
        );
      }
      return org;
    }

    if (
      this.isOrgAdmin(user) &&
      this.getOrganizationIds(user).includes(organizationId)
    ) {
      const org = await this.prisma.organization.findUnique({
        where: { id: organizationId },
      });
      if (!org) {
        throw new NotFoundException(
          `Organization with id ${organizationId} not found`
        );
      }
      return org;
    }

    throw new ForbiddenException('No access to this organization');
  }

  async assertCompanyAccess(
    user: AuthUserContext,
    companyId: string
  ): Promise<Company & { organizationId: string }> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with id ${companyId} not found`);
    }

    if (this.isAdmin(user)) {
      return company;
    }

    if (
      this.isOrgAdmin(user) &&
      this.getOrganizationIds(user).includes(company.organizationId)
    ) {
      return company;
    }

    if (
      this.isEmployee(user) &&
      user.employeeProfile?.companyId === companyId
    ) {
      return company;
    }

    throw new ForbiddenException('No access to this company');
  }

  async assertSurveyDesignAccess(
    user: AuthUserContext,
    surveyId: string
  ): Promise<void> {
    if (this.isAdmin(user)) {
      return;
    }

    if (this.isDesigner(user)) {
      const survey = await this.prisma.survey.findUnique({
        where: { id: surveyId },
        select: { createdById: true },
      });
      if (!survey) {
        throw new NotFoundException(`Survey with id ${surveyId} not found`);
      }
      if (survey.createdById !== user.id) {
        throw new ForbiddenException('Only the survey creator can access this survey');
      }
      return;
    }

    throw new ForbiddenException('No access to survey design');
  }

  async assertSurveyAvailableToOrg(
    user: AuthUserContext,
    surveyId: string,
    organizationId: string
  ): Promise<void> {
    await this.assertOrganizationAccess(user, organizationId);

    const assignment = await this.prisma.organizationSurvey.findUnique({
      where: {
        organizationId_surveyId: { organizationId, surveyId },
      },
    });

    if (!assignment) {
      throw new ForbiddenException(
        'Survey is not assigned to this organization'
      );
    }
  }

  denyOrgDataAccess(user: AuthUserContext): void {
    if (this.isDesigner(user) || this.isEmployee(user)) {
      throw new ForbiddenException('No access to organization data');
    }
  }
}
