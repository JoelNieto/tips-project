import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Prisma } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import { SurveyService } from './survey.service';
import type { CreateSurveyAssignationInput } from './dto/create-survey-assignation.input';

const assignationInclude = {
  company: { include: { createdBy: true } },
  createdBy: true,
  survey: { select: { id: true, title: true } },
  invitees: { orderBy: { createdAt: 'asc' as const } },
} satisfies Prisma.SurveyAssignationInclude;

@Injectable()
export class SurveyAssignationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly surveyService: SurveyService
  ) {}

  async findBySurvey(surveyId: string, userId: string) {
    await this.assertSurveyOwnership(surveyId, userId);
    const rows = await this.prisma.surveyAssignation.findMany({
      where: { surveyId, createdById: userId },
      include: assignationInclude,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => ({
      ...row,
      inviteeCount: row.invitees.length,
    }));
  }

  async findOne(id: string, userId: string) {
    const assignation = await this.prisma.surveyAssignation.findUnique({
      where: { id },
      include: assignationInclude,
    });
    if (!assignation) {
      throw new NotFoundException(`Survey assignation with id ${id} not found`);
    }
    if (assignation.createdById !== userId) {
      throw new ForbiddenException(
        'Only the creator can view this survey assignation'
      );
    }
    return { ...assignation, inviteeCount: assignation.invitees.length };
  }

  async create(input: CreateSurveyAssignationInput, userId: string) {
    await this.assertSurveyOwnership(input.surveyId, userId);

    const company = await this.prisma.company.findUnique({
      where: { id: input.companyId },
    });
    if (!company) {
      throw new NotFoundException(`Company with id ${input.companyId} not found`);
    }

    const startDate = new Date(input.startDate);
    const expirationDate = new Date(input.expirationDate);
    if (startDate >= expirationDate) {
      throw new BadRequestException('Start date must be before expiration date');
    }

    const normalizedInvitees = this.normalizeInvitees(input.invitees);

    const assignation = await this.prisma.$transaction(async (tx) => {
      const created = await tx.surveyAssignation.create({
        data: {
          surveyId: input.surveyId,
          companyId: input.companyId,
          welcomeMessage: input.welcomeMessage ?? undefined,
          startDate,
          expirationDate,
          createdById: userId,
        },
      });

      await tx.surveyInvitee.createMany({
        data: normalizedInvitees.map((invitee) => ({
          assignationId: created.id,
          email: invitee.email,
          name: invitee.name,
          token: randomUUID(),
        })),
      });

      return tx.surveyAssignation.findUnique({
        where: { id: created.id },
        include: assignationInclude,
      });
    });

    if (!assignation) {
      throw new NotFoundException('Failed to load created survey assignation');
    }
    return { ...assignation, inviteeCount: assignation.invitees.length };
  }

  async findInviteByToken(token: string) {
    const invitee = await this.prisma.surveyInvitee.findUnique({
      where: { token },
      include: {
        assignation: {
          include: { company: true },
        },
      },
    });

    if (!invitee) {
      throw new NotFoundException('Invitation not found');
    }

    const { assignation } = invitee;
    const now = new Date();

    if (now < assignation.startDate) {
      throw new ForbiddenException('This invitation is not active yet');
    }

    if (now > assignation.expirationDate) {
      throw new ForbiddenException('This invitation has expired');
    }

    const survey = await this.surveyService.findOne(assignation.surveyId);
    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    return {
      token: invitee.token,
      email: invitee.email,
      name: invitee.name,
      welcomeMessage: assignation.welcomeMessage,
      companyName: assignation.company.name,
      startDate: assignation.startDate,
      expirationDate: assignation.expirationDate,
      survey,
    };
  }

  async delete(id: string, userId: string) {
    const existing = await this.prisma.surveyAssignation.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Survey assignation with id ${id} not found`);
    }
    if (existing.createdById !== userId) {
      throw new ForbiddenException(
        'Only the creator can delete this survey assignation'
      );
    }
    return this.prisma.surveyAssignation.delete({
      where: { id },
      include: assignationInclude,
    });
  }

  private async assertSurveyOwnership(surveyId: string, userId: string) {
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
    });
    if (!survey) {
      throw new NotFoundException(`Survey with id ${surveyId} not found`);
    }
    if (survey.createdById !== userId) {
      throw new ForbiddenException('Only the survey creator can manage assignations');
    }
  }

  private normalizeInvitees(
    invitees: CreateSurveyAssignationInput['invitees']
  ): { email: string; name?: string }[] {
    const seen = new Set<string>();
    const result: { email: string; name?: string }[] = [];

    for (const invitee of invitees) {
      const email = invitee.email.trim().toLowerCase();
      if (!email || seen.has(email)) {
        continue;
      }
      seen.add(email);
      const name = invitee.name?.trim();
      result.push({
        email,
        name: name || undefined,
      });
    }

    if (result.length === 0) {
      throw new BadRequestException('At least one valid invitee email is required');
    }

    return result;
  }
}
