import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Survey, Prisma, User } from '@generated/prisma';
import { UserRole } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import type { AuthUserContext } from '../auth/auth-policy.service';
import { AuthPolicyService } from '../auth/auth-policy.service';
import type { CreateSurveyInput } from './dto/create-survey.input';
import type { UpdateSurveyInput } from './dto/update-survey.input';

@Injectable()
export class SurveyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authPolicy: AuthPolicyService
  ) {}

  private surveyInclude = {
    surveyType: true,
    createdBy: true,
    dimensions: {
      where: { parentDimensionId: null },
      include: {
        mainQuestionAnswers: { orderBy: { sortOrder: 'asc' as const } },
        scoreRanges: { orderBy: { order: 'asc' as const } },
        dimensionQuestions: {
          include: {
            question: {
              include: {
                answerSet: {
                  include: { answers: { orderBy: { sortOrder: 'asc' as const } } },
                },
              },
            },
            answerOverrides: true,
          },
          orderBy: { order: 'asc' as const },
        },
        subdimensions: {
          include: {
            mainQuestionAnswers: { orderBy: { sortOrder: 'asc' as const } },
            scoreRanges: { orderBy: { order: 'asc' as const } },
            dimensionQuestions: {
              include: {
                question: {
                  include: {
                    answerSet: {
                      include: { answers: { orderBy: { sortOrder: 'asc' as const } } },
                    },
                  },
                },
                answerOverrides: true,
              },
              orderBy: { order: 'asc' as const },
            },
          },
          orderBy: { order: 'asc' as const },
        },
      },
      orderBy: { order: 'asc' as const },
    },
  } satisfies Prisma.SurveyInclude;

  async findAll(user: AuthUserContext): Promise<Survey[]> {
    const where: Prisma.SurveyWhereInput = {};

    if (this.authPolicy.isAdmin(user)) {
      // no filter
    } else if (this.authPolicy.isDesigner(user)) {
      where.createdById = user.id;
    } else if (this.authPolicy.isOrgAdmin(user)) {
      const orgIds = this.authPolicy.getOrganizationIds(user);
      where.organizationSurveys = {
        some: { organizationId: { in: orgIds } },
      };
    } else {
      throw new ForbiddenException('No access to surveys');
    }

    return this.prisma.survey.findMany({
      where,
      include: this.surveyInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user?: AuthUserContext) {
    const survey = await this.prisma.survey.findUnique({
      where: { id },
      include: this.surveyInclude,
    });

    if (!survey || !user) {
      return survey;
    }

    await this.assertReadAccess(user, survey.id, survey.createdById);
    return survey;
  }

  async create(input: CreateSurveyInput, user: AuthUserContext) {
    this.authPolicy.assertRole(user, [UserRole.ADMIN, UserRole.DESIGNER]);
    const surveyType = await this.prisma.surveyType.findUnique({
      where: { id: input.surveyTypeId },
    });
    if (!surveyType) {
      throw new NotFoundException(
        `Survey type with id ${input.surveyTypeId} not found`
      );
    }

    if (!surveyType.hasCategories) {
      const survey = await this.prisma.$transaction(async (tx) => {
        const s = await tx.survey.create({
          data: {
            title: input.title,
            surveyTypeId: input.surveyTypeId,
            description: input.description ?? undefined,
            createdById: user.id,
          },
        });
        await tx.dimension.create({
          data: {
            surveyId: s.id,
            title: 'General',
            order: 0,
          },
        });
        return s;
      });
      const result = await this.findOne(survey.id);
      if (!result) throw new NotFoundException('Failed to load created survey');
      return result;
    }

    const survey = await this.prisma.survey.create({
      data: {
        title: input.title,
        surveyTypeId: input.surveyTypeId,
        description: input.description ?? undefined,
        createdById: user.id,
      },
    });
    const result = await this.findOne(survey.id);
    if (!result) throw new NotFoundException('Failed to load created survey');
    return result;
  }

  async update(
    id: string,
    input: UpdateSurveyInput,
    user: AuthUserContext
  ): Promise<Survey & { surveyType: unknown; createdBy: User }> {
    await this.assertWriteAccess(user, id);
    const updated = await this.prisma.survey.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.surveyTypeId !== undefined && { surveyTypeId: input.surveyTypeId }),
        ...(input.description !== undefined && { description: input.description }),
      },
    });
    const result = await this.findOne(updated.id);
    if (!result) throw new NotFoundException(`Survey with id ${id} not found`);
    return result;
  }

  async delete(id: string, user: AuthUserContext): Promise<Survey> {
    await this.assertWriteAccess(user, id);
    return this.prisma.survey.delete({ where: { id } });
  }

  private async assertReadAccess(
    user: AuthUserContext,
    surveyId: string,
    createdById: string
  ): Promise<void> {
    if (this.authPolicy.isAdmin(user)) {
      return;
    }

    if (this.authPolicy.isDesigner(user) && createdById === user.id) {
      return;
    }

    if (this.authPolicy.isOrgAdmin(user)) {
      const orgIds = this.authPolicy.getOrganizationIds(user);
      const assignment = await this.prisma.organizationSurvey.findFirst({
        where: { surveyId, organizationId: { in: orgIds } },
      });
      if (assignment) {
        return;
      }
    }

    throw new ForbiddenException('No access to this survey');
  }

  private async assertWriteAccess(
    user: AuthUserContext,
    surveyId: string
  ): Promise<void> {
    const existing = await this.prisma.survey.findUnique({ where: { id: surveyId } });
    if (!existing) {
      throw new NotFoundException(`Survey with id ${surveyId} not found`);
    }

    if (this.authPolicy.isAdmin(user)) {
      return;
    }

    if (this.authPolicy.isDesigner(user) && existing.createdById === user.id) {
      return;
    }

    throw new ForbiddenException('Only survey designers can modify this survey');
  }
}
