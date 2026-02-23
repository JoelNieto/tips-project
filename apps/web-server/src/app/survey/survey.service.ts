import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Survey, Prisma, User } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import type { CreateSurveyInput } from './dto/create-survey.input';
import type { UpdateSurveyInput } from './dto/update-survey.input';

@Injectable()
export class SurveyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(createdById?: string): Promise<Survey[]> {
    const where: Prisma.SurveyWhereInput = {};
    if (createdById) {
      where.createdById = createdById;
    }
    return this.prisma.survey.findMany({
      where,
      include: {
        surveyType: true,
        createdBy: true,
        dimensions: {
          where: { parentDimensionId: null },
          include: {
            mainQuestionAnswers: true,
            dimensionQuestions: {
              include: { question: { include: { answers: true } }, answerOverrides: true },
            },
            subdimensions: {
              include: {
                mainQuestionAnswers: true,
                dimensionQuestions: {
                  include: { question: { include: { answers: true } }, answerOverrides: true },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(
    id: string
  ): Promise<(Survey & { surveyType: unknown; createdBy: User }) | null> {
    return this.prisma.survey.findUnique({
      where: { id },
      include: {
        surveyType: true,
        createdBy: true,
        dimensions: {
          where: { parentDimensionId: null },
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
        },
      },
    });
  }

  async create(input: CreateSurveyInput, createdById: string) {
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
            createdById,
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
        createdById,
      },
    });
    const result = await this.findOne(survey.id);
    if (!result) throw new NotFoundException('Failed to load created survey');
    return result;
  }

  async update(
    id: string,
    input: UpdateSurveyInput,
    userId: string
  ): Promise<Survey & { surveyType: unknown; createdBy: User }> {
    const existing = await this.prisma.survey.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Survey with id ${id} not found`);
    }
    if (existing.createdById !== userId) {
      throw new ForbiddenException('Only the creator can update this survey');
    }
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

  async delete(id: string, userId: string): Promise<Survey> {
    const existing = await this.prisma.survey.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Survey with id ${id} not found`);
    }
    if (existing.createdById !== userId) {
      throw new ForbiddenException('Only the creator can delete this survey');
    }
    return this.prisma.survey.delete({ where: { id } });
  }
}
