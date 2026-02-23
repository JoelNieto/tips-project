import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { DimensionQuestion } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import type { AddQuestionToDimensionInput } from './dto/add-question-to-dimension.input';
import type { UpdateDimensionQuestionOverridesInput } from './dto/update-dimension-question-overrides.input';

@Injectable()
export class DimensionQuestionService {
  constructor(private readonly prisma: PrismaService) {}

  async addQuestionToDimension(
    input: AddQuestionToDimensionInput,
    userId: string
  ): Promise<DimensionQuestion> {
    const dimension = await this.prisma.dimension.findUnique({
      where: { id: input.dimensionId },
      include: { survey: { select: { createdById: true } } },
    });
    if (!dimension) {
      throw new NotFoundException(`Dimension with id ${input.dimensionId} not found`);
    }
    if (dimension.survey.createdById !== userId) {
      throw new ForbiddenException(
        'Only the survey creator can add questions to dimensions'
      );
    }
    const question = await this.prisma.question.findUnique({
      where: { id: input.questionId },
    });
    if (!question) {
      throw new NotFoundException(`Question with id ${input.questionId} not found`);
    }
    const existing = await this.prisma.dimensionQuestion.findFirst({
      where: { dimensionId: input.dimensionId, questionId: input.questionId },
    });
    if (existing) {
      throw new ForbiddenException('This question is already in the dimension');
    }
    return this.prisma.dimensionQuestion.create({
      data: {
        dimensionId: input.dimensionId,
        questionId: input.questionId,
        order: input.order ?? undefined,
        weightOverride: input.weightOverride ?? undefined,
        isReversedOverride: input.isReversedOverride ?? undefined,
        isMultiAnswerOverride: input.isMultiAnswerOverride ?? undefined,
      },
      include: {
        question: { include: { answers: true } },
        dimension: true,
      },
    });
  }

  async removeQuestionFromDimension(
    dimensionQuestionId: string,
    userId: string
  ): Promise<DimensionQuestion> {
    const dq = await this.prisma.dimensionQuestion.findUnique({
      where: { id: dimensionQuestionId },
      include: {
        dimension: { include: { survey: { select: { createdById: true } } } },
        question: { include: { answers: true } },
        answerOverrides: true,
      },
    });
    if (!dq) {
      throw new NotFoundException(
        `Dimension question with id ${dimensionQuestionId} not found`
      );
    }
    if (dq.dimension.survey.createdById !== userId) {
      throw new ForbiddenException(
        'Only the survey creator can remove questions from dimensions'
      );
    }
    await this.prisma.dimensionQuestion.delete({
      where: { id: dimensionQuestionId },
    });
    return dq as unknown as DimensionQuestion;
  }

  async updateOverrides(
    input: UpdateDimensionQuestionOverridesInput,
    userId: string
  ): Promise<DimensionQuestion> {
    const dq = await this.prisma.dimensionQuestion.findUnique({
      where: { id: input.dimensionQuestionId },
      include: {
        dimension: { include: { survey: { select: { createdById: true } } } },
      },
    });
    if (!dq) {
      throw new NotFoundException(
        `Dimension question with id ${input.dimensionQuestionId} not found`
      );
    }
    if (dq.dimension.survey.createdById !== userId) {
      throw new ForbiddenException(
        'Only the survey creator can update dimension question overrides'
      );
    }
    return this.prisma.dimensionQuestion.update({
      where: { id: input.dimensionQuestionId },
      data: {
        ...(input.order !== undefined && { order: input.order }),
        ...(input.weightOverride !== undefined && {
          weightOverride: input.weightOverride,
        }),
        ...(input.isReversedOverride !== undefined && {
          isReversedOverride: input.isReversedOverride,
        }),
        ...(input.isMultiAnswerOverride !== undefined && {
          isMultiAnswerOverride: input.isMultiAnswerOverride,
        }),
      },
      include: {
        question: { include: { answers: true } },
        answerOverrides: true,
      },
    });
  }
}
