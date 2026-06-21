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
import type {
  SubmitSurveyFillInput,
  SubmitSurveyMainAnswerInput,
  SubmitSurveyQuestionAnswerInput,
} from './dto/submit-survey-fill.input';

const assignationInclude = {
  company: { include: { createdBy: true } },
  createdBy: true,
  survey: { select: { id: true, title: true } },
  invitees: {
    orderBy: { createdAt: 'asc' as const },
    include: {
      fill: { select: { id: true, submittedAt: true } },
      employee: { include: { position: true } },
    },
  },
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

    const normalizedInvitees = await this.resolveRecipients(
      input,
      input.companyId
    );

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
          employeeId: invitee.employeeId,
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
        fill: true,
        assignation: {
          include: { company: true },
        },
      },
    });

    if (!invitee) {
      throw new NotFoundException('Invitation not found');
    }

    const { assignation } = invitee;
    this.assertAssignationActive(assignation);

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
      submittedAt: invitee.fill?.submittedAt ?? null,
      survey,
    };
  }

  async submitFill(input: SubmitSurveyFillInput) {
    const mainAnswers = input.mainAnswers ?? [];
    const questionAnswers = input.questionAnswers ?? [];

    if (mainAnswers.length === 0 && questionAnswers.length === 0) {
      throw new BadRequestException('At least one answer is required');
    }

    const invitee = await this.prisma.surveyInvitee.findUnique({
      where: { token: input.token },
      include: {
        fill: true,
        assignation: true,
      },
    });

    if (!invitee) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitee.fill) {
      throw new BadRequestException('This survey has already been submitted');
    }

    this.assertAssignationActive(invitee.assignation);

    const surveyId = invitee.assignation.surveyId;
    const mainAnswerRows = await this.normalizeMainAnswers(
      surveyId,
      mainAnswers
    );
    const questionAnswerRows = await this.normalizeQuestionAnswers(
      surveyId,
      questionAnswers
    );

    return this.prisma.surveyFill.create({
      data: {
        surveyId,
        inviteeId: invitee.id,
        mainAnswers: { create: mainAnswerRows },
        questionAnswers: { create: questionAnswerRows },
      },
    });
  }

  async findFillResults(id: string, userId: string) {
    const assignation = await this.prisma.surveyAssignation.findUnique({
      where: { id },
      select: {
        createdById: true,
        survey: {
          select: {
            surveyType: {
              select: {
                hasCategories: true,
                hasSubcategories: true,
                categoryName: true,
                subcategoryName: true,
                visibleCategories: true,
                visibleSubcategories: true,
              },
            },
          },
        },
      },
    });
    if (!assignation) {
      throw new NotFoundException(`Survey assignation with id ${id} not found`);
    }
    if (assignation.createdById !== userId) {
      throw new ForbiddenException('Only the creator can view fill results');
    }

    const surveyType = assignation.survey?.surveyType ?? {
      hasCategories: false,
      hasSubcategories: false,
      categoryName: null,
      subcategoryName: null,
      visibleCategories: false,
      visibleSubcategories: false,
    };

    const parentDimensionSelect = {
      id: true,
      title: true,
    } as const;

    const fills = await this.prisma.surveyFill.findMany({
      where: { invitee: { assignationId: id } },
      include: {
        invitee: { select: { id: true, email: true, name: true } },
        mainAnswers: {
          include: {
            dimension: {
              select: {
                id: true,
                title: true,
                parentDimension: { select: parentDimensionSelect },
              },
            },
            mainQuestionAnswer: { select: { id: true, text: true, value: true } },
          },
        },
        questionAnswers: {
          include: {
            dimensionQuestion: {
              include: {
                dimension: {
                  select: {
                    id: true,
                    title: true,
                    parentDimension: { select: parentDimensionSelect },
                  },
                },
                question: { select: { id: true, title: true, text: true } },
              },
            },
            answer: { select: { id: true, text: true, value: true } },
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });

    return {
      surveyType,
      fills: fills.map((fill) => ({
        inviteeId: fill.inviteeId,
        inviteeEmail: fill.invitee.email,
        inviteeName: fill.invitee.name,
        submittedAt: fill.submittedAt,
        mainAnswers: fill.mainAnswers.map((ma) => ({
          dimensionId: ma.dimension.id,
          dimensionTitle: ma.dimension.title,
          categoryId: ma.dimension.parentDimension?.id ?? null,
          categoryTitle: ma.dimension.parentDimension?.title ?? null,
          answerText: ma.mainQuestionAnswer.text,
          answerValue: ma.mainQuestionAnswer.value,
        })),
        questionAnswers: this.groupQuestionAnswers(fill.questionAnswers),
      })),
    };
  }

  private groupQuestionAnswers(
    rows: {
      dimensionQuestionId: string;
      dimensionQuestion: {
        dimension: {
          id: string;
          title: string;
          parentDimension: { id: string; title: string } | null;
        };
        question: { id: string; title: string; text: string };
      };
      answer: { id: string; text: string; value: number };
    }[]
  ) {
    const groups = new Map<
      string,
      {
        dimensionQuestionId: string;
        dimensionId: string;
        dimensionTitle: string;
        categoryId: string | null;
        categoryTitle: string | null;
        questionText: string;
        answers: { id: string; text: string; value: number }[];
      }
    >();

    for (const row of rows) {
      if (!groups.has(row.dimensionQuestionId)) {
        const q = row.dimensionQuestion.question;
        const dim = row.dimensionQuestion.dimension;
        groups.set(row.dimensionQuestionId, {
          dimensionQuestionId: row.dimensionQuestionId,
          dimensionId: dim.id,
          dimensionTitle: dim.title,
          categoryId: dim.parentDimension?.id ?? null,
          categoryTitle: dim.parentDimension?.title ?? null,
          questionText: q.text?.trim() || q.title,
          answers: [],
        });
      }
      groups.get(row.dimensionQuestionId)!.answers.push(row.answer);
    }

    return [...groups.values()];
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

  private assertAssignationActive(assignation: {
    startDate: Date;
    expirationDate: Date;
  }): void {
    const now = new Date();

    if (now < assignation.startDate) {
      throw new ForbiddenException('This invitation is not active yet');
    }

    if (now > assignation.expirationDate) {
      throw new ForbiddenException('This invitation has expired');
    }
  }

  private async normalizeMainAnswers(
    surveyId: string,
    answers: SubmitSurveyMainAnswerInput[]
  ): Promise<{ dimensionId: string; mainQuestionAnswerId: string }[]> {
    const byDimension = new Map<string, string>();
    for (const answer of answers) {
      if (byDimension.has(answer.dimensionId)) {
        throw new BadRequestException(
          'Only one main answer can be submitted per dimension'
        );
      }
      byDimension.set(answer.dimensionId, answer.mainQuestionAnswerId);
    }

    const answerIds = [...byDimension.values()];
    if (answerIds.length === 0) return [];

    const validAnswers = await this.prisma.mainQuestionAnswer.findMany({
      where: {
        id: { in: answerIds },
        dimension: { surveyId },
      },
      select: {
        id: true,
        dimensionId: true,
      },
    });
    const validById = new Map(validAnswers.map((answer) => [answer.id, answer]));

    return answers.map((answer) => {
      const valid = validById.get(answer.mainQuestionAnswerId);
      if (!valid || valid.dimensionId !== answer.dimensionId) {
        throw new BadRequestException(
          'A main question answer does not belong to this survey'
        );
      }
      return {
        dimensionId: answer.dimensionId,
        mainQuestionAnswerId: answer.mainQuestionAnswerId,
      };
    });
  }

  private async normalizeQuestionAnswers(
    surveyId: string,
    answers: SubmitSurveyQuestionAnswerInput[]
  ): Promise<{ dimensionQuestionId: string; answerId: string }[]> {
    const byQuestion = new Map<string, string[]>();
    for (const answer of answers) {
      if (byQuestion.has(answer.dimensionQuestionId)) {
        throw new BadRequestException(
          'Answers for a question can only be submitted once'
        );
      }

      const answerIds = [...new Set(answer.answerIds)];
      if (answerIds.length !== answer.answerIds.length) {
        throw new BadRequestException(
          'Duplicate answers cannot be submitted for a question'
        );
      }
      byQuestion.set(answer.dimensionQuestionId, answerIds);
    }

    const dimensionQuestionIds = [...byQuestion.keys()];
    if (dimensionQuestionIds.length === 0) return [];

    const dimensionQuestions = await this.prisma.dimensionQuestion.findMany({
      where: {
        id: { in: dimensionQuestionIds },
        dimension: { surveyId },
      },
      include: {
        answerOverrides: true,
        question: {
          include: {
            answerSet: {
              include: {
                answers: true,
              },
            },
          },
        },
      },
    });
    const questionById = new Map(
      dimensionQuestions.map((question) => [question.id, question])
    );
    const rows: { dimensionQuestionId: string; answerId: string }[] = [];

    for (const [dimensionQuestionId, answerIds] of byQuestion.entries()) {
      const dimensionQuestion = questionById.get(dimensionQuestionId);
      if (!dimensionQuestion) {
        throw new BadRequestException(
          'A question answer does not belong to this survey'
        );
      }

      const isMultiAnswer =
        dimensionQuestion.isMultiAnswerOverride ??
        dimensionQuestion.question.isMultiAnswer;
      if (!isMultiAnswer && answerIds.length > 1) {
        throw new BadRequestException(
          'Only one answer can be submitted for a single-answer question'
        );
      }

      const allowedAnswerIds =
        dimensionQuestion.answerOverrides.length > 0
          ? dimensionQuestion.answerOverrides.map((override) => override.answerId)
          : dimensionQuestion.question.answerSet?.answers.map((answer) => answer.id) ??
            [];
      const allowed = new Set(allowedAnswerIds);

      for (const answerId of answerIds) {
        if (!allowed.has(answerId)) {
          throw new BadRequestException(
            'An answer does not belong to its submitted question'
          );
        }
        rows.push({ dimensionQuestionId, answerId });
      }
    }

    return rows;
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

  private async resolveRecipients(
    input: CreateSurveyAssignationInput,
    companyId: string
  ): Promise<{ email: string; name?: string; employeeId?: string }[]> {
    const invitees = input.invitees ?? [];
    const employeeIds = [...new Set(input.employeeIds ?? [])];
    const positionIds = [...new Set(input.positionIds ?? [])];

    if (
      invitees.length === 0 &&
      employeeIds.length === 0 &&
      positionIds.length === 0
    ) {
      throw new BadRequestException(
        'At least one invitee, employee, or position is required'
      );
    }

    const employeesById =
      employeeIds.length > 0
        ? await this.prisma.employee.findMany({
            where: {
              id: { in: employeeIds },
              companyId,
              status: 'ACTIVE',
            },
          })
        : [];

    if (employeeIds.length > 0 && employeesById.length !== employeeIds.length) {
      throw new BadRequestException(
        'One or more selected employees were not found or are inactive'
      );
    }

    const positions =
      positionIds.length > 0
        ? await this.prisma.position.findMany({
            where: { id: { in: positionIds }, companyId },
          })
        : [];

    if (positionIds.length > 0 && positions.length !== positionIds.length) {
      throw new BadRequestException(
        'One or more selected positions were not found'
      );
    }

    const employeesFromPositions =
      positionIds.length > 0
        ? await this.prisma.employee.findMany({
            where: {
              companyId,
              status: 'ACTIVE',
              positionId: { in: positionIds },
            },
          })
        : [];

    const employeeMap = new Map<
      string,
      (typeof employeesById)[number]
    >();
    for (const employee of [...employeesById, ...employeesFromPositions]) {
      employeeMap.set(employee.id, employee);
    }

    const byEmail = new Map<
      string,
      { email: string; name?: string; employeeId?: string }
    >();

    for (const employee of employeeMap.values()) {
      const email = employee.email.trim().toLowerCase();
      if (!email) {
        continue;
      }
      byEmail.set(email, {
        email,
        name: `${employee.firstName} ${employee.lastName}`.trim(),
        employeeId: employee.id,
      });
    }

    for (const invitee of invitees) {
      const email = invitee.email.trim().toLowerCase();
      if (!email) {
        continue;
      }
      const manualName = invitee.name?.trim();
      const existing = byEmail.get(email);
      if (existing) {
        if (manualName) {
          existing.name = manualName;
        }
      } else {
        byEmail.set(email, {
          email,
          name: manualName || undefined,
        });
      }
    }

    const result = Array.from(byEmail.values());
    if (result.length === 0) {
      throw new BadRequestException('At least one valid recipient is required');
    }

    return result;
  }
}
