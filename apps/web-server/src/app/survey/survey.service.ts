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
import type { DuplicateSurveyInput } from './dto/duplicate-survey.input';
import type { UpdateSurveyInput } from './dto/update-survey.input';

type LoadedSurvey = NonNullable<Awaited<ReturnType<SurveyService['findOne']>>>;
type LoadedDimension = LoadedSurvey['dimensions'][number];
type LoadedSubdimension = LoadedDimension['subdimensions'][number];
type LoadedDimensionContent = LoadedDimension | LoadedSubdimension;
type LoadedDimensionQuestion =
  LoadedDimensionContent['dimensionQuestions'][number];
type LoadedQuestion = LoadedDimensionQuestion['question'];
type LoadedAnswerSet = NonNullable<LoadedQuestion['answerSet']>;

@Injectable()
export class SurveyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authPolicy: AuthPolicyService
  ) {}

  private surveyInclude = {
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
    const hasCategories = input.hasCategories ?? false;
    const surveyData = {
      title: input.title,
      description: input.description ?? undefined,
      categoryName: input.categoryName ?? undefined,
      subcategoryName: input.subcategoryName ?? undefined,
      hasCategories,
      hasSubcategories: input.hasSubcategories ?? false,
      visibleCategories: input.visibleCategories ?? false,
      visibleSubcategories: input.visibleSubcategories ?? false,
      randomizeQuestions: input.randomizeQuestions ?? false,
      presentAllQuestionsAtOnce: input.presentAllQuestionsAtOnce ?? true,
      allowPreviousQuestion: input.allowPreviousQuestion ?? false,
      createdById: user.id,
    };

    if (!hasCategories) {
      const survey = await this.prisma.$transaction(async (tx) => {
        const s = await tx.survey.create({ data: surveyData });
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

    const survey = await this.prisma.survey.create({ data: surveyData });
    const result = await this.findOne(survey.id);
    if (!result) throw new NotFoundException('Failed to load created survey');
    return result;
  }

  async update(
    id: string,
    input: UpdateSurveyInput,
    user: AuthUserContext
  ): Promise<Survey & { createdBy: User }> {
    await this.assertWriteAccess(user, id);
    const updated = await this.prisma.survey.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.categoryName !== undefined && { categoryName: input.categoryName }),
        ...(input.subcategoryName !== undefined && { subcategoryName: input.subcategoryName }),
        ...(input.hasCategories !== undefined && { hasCategories: input.hasCategories }),
        ...(input.hasSubcategories !== undefined && { hasSubcategories: input.hasSubcategories }),
        ...(input.visibleCategories !== undefined && { visibleCategories: input.visibleCategories }),
        ...(input.visibleSubcategories !== undefined && { visibleSubcategories: input.visibleSubcategories }),
        ...(input.randomizeQuestions !== undefined && { randomizeQuestions: input.randomizeQuestions }),
        ...(input.presentAllQuestionsAtOnce !== undefined && { presentAllQuestionsAtOnce: input.presentAllQuestionsAtOnce }),
        ...(input.allowPreviousQuestion !== undefined && { allowPreviousQuestion: input.allowPreviousQuestion }),
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

  async duplicate(
    id: string,
    input: DuplicateSurveyInput | undefined,
    user: AuthUserContext
  ) {
    this.authPolicy.assertRole(user, [UserRole.ADMIN, UserRole.DESIGNER]);

    const source = await this.findOne(id, user);
    if (!source) {
      throw new NotFoundException(`Survey with id ${id} not found`);
    }

    const duplicatedSurveyId = await this.prisma.$transaction(async (tx) => {
      const survey = await tx.survey.create({
        data: {
          title: input?.title?.trim() || `${source.title} (Copy)`,
          description: source.description ?? undefined,
          categoryName: source.categoryName ?? undefined,
          subcategoryName: source.subcategoryName ?? undefined,
          hasCategories: source.hasCategories,
          hasSubcategories: source.hasSubcategories,
          visibleCategories: source.visibleCategories,
          visibleSubcategories: source.visibleSubcategories,
          randomizeQuestions: source.randomizeQuestions,
          presentAllQuestionsAtOnce: source.presentAllQuestionsAtOnce,
          allowPreviousQuestion: source.allowPreviousQuestion,
          createdById: user.id,
        },
      });

      const questionIdMap = new Map<string, string>();
      const clonedAnswerSets = new Map<
        string,
        { answerSetId: string; answerIdMap: Map<string, string> }
      >();

      for (const dimension of source.dimensions) {
        const newDimension = await tx.dimension.create({
          data: {
            surveyId: survey.id,
            title: dimension.title,
            description: dimension.description ?? undefined,
            weighting: dimension.weighting ?? undefined,
            mainQuestionText: dimension.mainQuestionText ?? undefined,
            order: dimension.order ?? undefined,
          },
        });

        await this.copyDimensionTree(
          tx,
          dimension,
          newDimension.id,
          user.id,
          questionIdMap,
          clonedAnswerSets
        );

        for (const subdimension of dimension.subdimensions ?? []) {
          const newSubdimension = await tx.dimension.create({
            data: {
              surveyId: survey.id,
              parentDimensionId: newDimension.id,
              title: subdimension.title,
              description: subdimension.description ?? undefined,
              weighting: subdimension.weighting ?? undefined,
              mainQuestionText: subdimension.mainQuestionText ?? undefined,
              order: subdimension.order ?? undefined,
            },
          });

          await this.copyDimensionTree(
            tx,
            subdimension,
            newSubdimension.id,
            user.id,
            questionIdMap,
            clonedAnswerSets
          );
        }
      }

      return survey.id;
    });

    const result = await this.findOne(duplicatedSurveyId);
    if (!result) {
      throw new NotFoundException('Failed to load duplicated survey');
    }
    return result;
  }

  private async copyDimensionTree(
    tx: Prisma.TransactionClient,
    sourceDimension: LoadedDimensionContent,
    targetDimensionId: string,
    userId: string,
    questionIdMap: Map<string, string>,
    clonedAnswerSets: Map<
      string,
      { answerSetId: string; answerIdMap: Map<string, string> }
    >
  ): Promise<void> {
    if (sourceDimension.mainQuestionAnswers.length > 0) {
      await tx.mainQuestionAnswer.createMany({
        data: sourceDimension.mainQuestionAnswers.map((answer) => ({
          dimensionId: targetDimensionId,
          text: answer.text,
          sortOrder: answer.sortOrder ?? undefined,
          value: answer.value,
          reverseValue: answer.reverseValue ?? undefined,
        })),
      });
    }

    if (sourceDimension.scoreRanges.length > 0) {
      await tx.dimensionScoreRange.createMany({
        data: sourceDimension.scoreRanges.map((range) => ({
          dimensionId: targetDimensionId,
          label: range.label ?? undefined,
          message: range.message,
          minValue: range.minValue,
          maxValue: range.maxValue,
          order: range.order ?? undefined,
        })),
      });
    }

    for (const dimensionQuestion of sourceDimension.dimensionQuestions) {
      const questionId = await this.getOrCloneQuestion(
        tx,
        dimensionQuestion.question,
        userId,
        questionIdMap,
        clonedAnswerSets
      );

      const createdDimensionQuestion = await tx.dimensionQuestion.create({
        data: {
          dimensionId: targetDimensionId,
          questionId,
          order: dimensionQuestion.order ?? undefined,
          weightOverride: dimensionQuestion.weightOverride ?? undefined,
          isReversedOverride:
            dimensionQuestion.isReversedOverride ?? undefined,
          isMultiAnswerOverride:
            dimensionQuestion.isMultiAnswerOverride ?? undefined,
        },
      });

      if (dimensionQuestion.answerOverrides.length === 0) {
        continue;
      }

      const sourceAnswerSetId = dimensionQuestion.question.answerSet?.id;
      const clonedAnswerSet = sourceAnswerSetId
        ? clonedAnswerSets.get(sourceAnswerSetId)
        : undefined;

      if (!clonedAnswerSet) {
        continue;
      }

      const overrideRows = dimensionQuestion.answerOverrides.flatMap(
        (override) => {
          const answerId = clonedAnswerSet.answerIdMap.get(override.answerId);
          if (!answerId) {
            return [];
          }

          return [
            {
              dimensionQuestionId: createdDimensionQuestion.id,
              answerId,
              valueOverride: override.valueOverride ?? undefined,
              reverseValueOverride: override.reverseValueOverride ?? undefined,
              orderOverride: override.orderOverride ?? undefined,
            },
          ];
        }
      );

      if (overrideRows.length > 0) {
        await tx.dimensionQuestionAnswer.createMany({ data: overrideRows });
      }
    }
  }

  private async getOrCloneQuestion(
    tx: Prisma.TransactionClient,
    sourceQuestion: LoadedQuestion,
    userId: string,
    questionIdMap: Map<string, string>,
    clonedAnswerSets: Map<
      string,
      { answerSetId: string; answerIdMap: Map<string, string> }
    >
  ): Promise<string> {
    const cachedQuestionId = questionIdMap.get(sourceQuestion.id);
    if (cachedQuestionId) {
      return cachedQuestionId;
    }

    const answerSetId = sourceQuestion.answerSet
      ? await this.getOrCloneAnswerSet(
          tx,
          sourceQuestion.answerSet,
          userId,
          clonedAnswerSets
        )
      : undefined;

    const question = await tx.question.create({
      data: {
        title: sourceQuestion.title,
        text: sourceQuestion.text,
        weight: sourceQuestion.weight ?? undefined,
        isReversed: sourceQuestion.isReversed,
        isMultiAnswer: sourceQuestion.isMultiAnswer,
        createdById: userId,
        answerSetId,
      },
    });

    questionIdMap.set(sourceQuestion.id, question.id);
    return question.id;
  }

  private async getOrCloneAnswerSet(
    tx: Prisma.TransactionClient,
    sourceAnswerSet: LoadedAnswerSet,
    userId: string,
    clonedAnswerSets: Map<
      string,
      { answerSetId: string; answerIdMap: Map<string, string> }
    >
  ): Promise<string> {
    const cachedAnswerSet = clonedAnswerSets.get(sourceAnswerSet.id);
    if (cachedAnswerSet) {
      return cachedAnswerSet.answerSetId;
    }

    const createdAnswerSet = await tx.answerSet.create({
      data: {
        name: sourceAnswerSet.name,
        description: sourceAnswerSet.description ?? undefined,
        createdById: userId,
        answers: {
          create: sourceAnswerSet.answers.map((answer, index) => ({
            text: answer.text,
            sortOrder: answer.sortOrder ?? index,
            value: answer.value,
            reverseValue: answer.reverseValue ?? undefined,
          })),
        },
      },
      include: {
        answers: { orderBy: { sortOrder: 'asc' } },
      },
    });

    const answerIdMap = new Map<string, string>();
    sourceAnswerSet.answers.forEach((sourceAnswer, index) => {
      const clonedAnswer = createdAnswerSet.answers[index];
      if (clonedAnswer) {
        answerIdMap.set(sourceAnswer.id, clonedAnswer.id);
      }
    });

    clonedAnswerSets.set(sourceAnswerSet.id, {
      answerSetId: createdAnswerSet.id,
      answerIdMap,
    });

    return createdAnswerSet.id;
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
