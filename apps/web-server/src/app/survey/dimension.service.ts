import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Dimension, Prisma, User } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import type { CreateDimensionInput } from './dto/create-dimension.input';
import type { UpdateDimensionInput } from './dto/update-dimension.input';

@Injectable()
export class DimensionService {
  constructor(private readonly prisma: PrismaService) {}

  async findBySurvey(surveyId: string): Promise<Dimension[]> {
    return this.prisma.dimension.findMany({
      where: { surveyId, parentDimensionId: null },
      include: {
        mainQuestionAnswers: { orderBy: { sortOrder: 'asc' } },
        dimensionQuestions: {
          include: {
            question: { include: { answers: { orderBy: { sortOrder: 'asc' } } } },
            answerOverrides: true,
          },
          orderBy: { order: 'asc' },
        },
        subdimensions: {
          include: {
            mainQuestionAnswers: { orderBy: { sortOrder: 'asc' } },
            dimensionQuestions: {
              include: {
                question: {
                  include: { answers: { orderBy: { sortOrder: 'asc' } } },
                },
                answerOverrides: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string): Promise<(Dimension & { survey: { createdById: string } }) | null> {
    return this.prisma.dimension.findUnique({
      where: { id },
      include: {
        survey: { select: { createdById: true } },
        mainQuestionAnswers: { orderBy: { sortOrder: 'asc' } },
        dimensionQuestions: {
          include: {
            question: { include: { answers: { orderBy: { sortOrder: 'asc' } } } },
            answerOverrides: true,
          },
          orderBy: { order: 'asc' },
        },
        subdimensions: {
          include: {
            mainQuestionAnswers: { orderBy: { sortOrder: 'asc' } },
            dimensionQuestions: {
              include: {
                question: {
                  include: { answers: { orderBy: { sortOrder: 'asc' } } },
                },
                answerOverrides: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async create(input: CreateDimensionInput, userId: string): Promise<Dimension> {
    const survey = await this.prisma.survey.findUnique({
      where: { id: input.surveyId },
      include: { surveyType: true },
    });
    if (!survey) {
      throw new NotFoundException(`Survey with id ${input.surveyId} not found`);
    }
    if (survey.createdById !== userId) {
      throw new ForbiddenException('Only the survey creator can add dimensions');
    }
    if (!survey.surveyType.hasCategories) {
      throw new ForbiddenException(
        'This survey type does not support multiple dimensions'
      );
    }
    if (input.parentDimensionId) {
      if (!survey.surveyType.hasSubcategories) {
        throw new ForbiddenException(
          'This survey type does not support subdimensions'
        );
      }
      const parent = await this.prisma.dimension.findUnique({
        where: { id: input.parentDimensionId },
      });
      if (!parent || parent.surveyId !== input.surveyId) {
        throw new NotFoundException('Parent dimension not found');
      }
    }
    return this.prisma.dimension.create({
      data: {
        surveyId: input.surveyId,
        parentDimensionId: input.parentDimensionId ?? undefined,
        title: input.title,
        description: input.description ?? undefined,
        weighting: input.weighting ?? undefined,
        mainQuestionText: input.mainQuestionText ?? undefined,
        order: input.order ?? undefined,
      },
    });
  }

  async update(
    id: string,
    input: UpdateDimensionInput,
    userId: string
  ): Promise<Dimension> {
    const existing = await this.prisma.dimension.findUnique({
      where: { id },
      include: { survey: { select: { createdById: true } } },
    });
    if (!existing) {
      throw new NotFoundException(`Dimension with id ${id} not found`);
    }
    if (existing.survey.createdById !== userId) {
      throw new ForbiddenException('Only the survey creator can update dimensions');
    }
    return this.prisma.dimension.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.weighting !== undefined && { weighting: input.weighting }),
        ...(input.mainQuestionText !== undefined && {
          mainQuestionText: input.mainQuestionText,
        }),
        ...(input.order !== undefined && { order: input.order }),
      },
    });
  }

  async delete(id: string, userId: string): Promise<Dimension> {
    const existing = await this.prisma.dimension.findUnique({
      where: { id },
      include: { survey: { select: { createdById: true } } },
    });
    if (!existing) {
      throw new NotFoundException(`Dimension with id ${id} not found`);
    }
    if (existing.survey.createdById !== userId) {
      throw new ForbiddenException('Only the survey creator can delete dimensions');
    }
    return this.prisma.dimension.delete({ where: { id } });
  }
}
