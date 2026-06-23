import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import type { AuthUserContext } from '../auth/auth-policy.service';
import { AuthPolicyService } from '../auth/auth-policy.service';
import type {
  AssignSurveyToOrganizationInput,
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from './dto/organization.input';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authPolicy: AuthPolicyService
  ) {}

  async findAll(user: AuthUserContext) {
    if (this.authPolicy.isAdmin(user)) {
      return this.prisma.organization.findMany({
        include: { createdBy: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (this.authPolicy.isOrgAdmin(user)) {
      const orgIds = this.authPolicy.getOrganizationIds(user);
      return this.prisma.organization.findMany({
        where: { id: { in: orgIds } },
        include: { createdBy: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    throw new ForbiddenException('No access to organizations');
  }

  async findOne(id: string, user: AuthUserContext) {
    await this.authPolicy.assertOrganizationAccess(user, id);
    return this.prisma.organization.findUnique({
      where: { id },
      include: { createdBy: true },
    });
  }

  async create(input: CreateOrganizationInput, user: AuthUserContext) {
    this.authPolicy.assertRole(user, [UserRole.ADMIN]);

    return this.prisma.organization.create({
      data: {
        name: input.name,
        description: input.description,
        createdById: user.id,
      },
      include: { createdBy: true },
    });
  }

  async update(
    id: string,
    input: UpdateOrganizationInput,
    user: AuthUserContext
  ) {
    this.authPolicy.assertRole(user, [UserRole.ADMIN]);
    await this.findOne(id, user);

    return this.prisma.organization.update({
      where: { id },
      data: input,
      include: { createdBy: true },
    });
  }

  async delete(id: string, user: AuthUserContext) {
    this.authPolicy.assertRole(user, [UserRole.ADMIN]);
    await this.findOne(id, user);

    return this.prisma.organization.delete({
      where: { id },
      include: { createdBy: true },
    });
  }

  async assignSurvey(
    input: AssignSurveyToOrganizationInput,
    user: AuthUserContext
  ) {
    this.authPolicy.assertRole(user, [UserRole.ADMIN]);

    const survey = await this.prisma.survey.findUnique({
      where: { id: input.surveyId },
    });
    if (!survey) {
      throw new NotFoundException(`Survey with id ${input.surveyId} not found`);
    }

    await this.findOne(input.organizationId, user);

    return this.prisma.organizationSurvey.create({
      data: {
        organizationId: input.organizationId,
        surveyId: input.surveyId,
        createdById: user.id,
      },
    });
  }

  async listAssignedSurveys(organizationId: string, user: AuthUserContext) {
    await this.authPolicy.assertOrganizationAccess(user, organizationId);

    return this.prisma.organizationSurvey.findMany({
      where: { organizationId },
      include: {
        survey: { include: { createdBy: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async removeSurveyAssignment(id: string, user: AuthUserContext) {
    this.authPolicy.assertRole(user, [UserRole.ADMIN]);

    const assignment = await this.prisma.organizationSurvey.findUnique({
      where: { id },
    });
    if (!assignment) {
      throw new NotFoundException('Organization survey assignment not found');
    }

    return this.prisma.organizationSurvey.delete({ where: { id } });
  }
}
