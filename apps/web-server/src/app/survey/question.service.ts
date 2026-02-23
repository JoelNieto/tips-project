import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Question, Prisma, User } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import type { CreateQuestionInput } from './dto/create-question.input';
import type { UpdateQuestionInput } from './dto/update-question.input';

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(createdById?: string): Promise<Question[]> {
    const where: Prisma.QuestionWhereInput = {};
    if (createdById) {
      where.createdById = createdById;
    }
    return this.prisma.question.findMany({
      where,
      include: {
        createdBy: true,
        answers: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Question & { createdBy: User } | null> {
    return this.prisma.question.findUnique({
      where: { id },
      include: {
        createdBy: true,
        answers: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async create(input: CreateQuestionInput, createdById: string): Promise<Question> {
    return this.prisma.question.create({
      data: {
        title: input.title,
        text: input.text,
        weight: input.weight ?? undefined,
        isReversed: input.isReversed ?? false,
        isMultiAnswer: input.isMultiAnswer ?? false,
        createdById,
        answers: input.answers?.length
          ? {
              create: input.answers.map((a, i) => ({
                text: a.text,
                sortOrder: a.sortOrder ?? i,
                value: a.value,
                reverseValue: a.reverseValue ?? undefined,
              })),
            }
          : undefined,
      },
      include: {
        createdBy: true,
        answers: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async update(
    id: string,
    input: UpdateQuestionInput,
    userId: string
  ): Promise<Question> {
    const existing = await this.prisma.question.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }
    if (existing.createdById !== userId) {
      throw new ForbiddenException('Only the creator can update this question');
    }
    return this.prisma.question.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.text !== undefined && { text: input.text }),
        ...(input.weight !== undefined && { weight: input.weight }),
        ...(input.isReversed !== undefined && { isReversed: input.isReversed }),
        ...(input.isMultiAnswer !== undefined && {
          isMultiAnswer: input.isMultiAnswer,
        }),
      },
      include: {
        createdBy: true,
        answers: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async delete(id: string, userId: string): Promise<Question> {
    const existing = await this.prisma.question.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }
    if (existing.createdById !== userId) {
      throw new ForbiddenException('Only the creator can delete this question');
    }
    return this.prisma.question.delete({ where: { id } });
  }

  async surveysUsingQuestion(questionId: string): Promise<
    { surveyId: string; surveyTitle: string; dimensionId: string; dimensionTitle: string }[]
  > {
    const usages = await this.prisma.dimensionQuestion.findMany({
      where: { questionId },
      include: {
        dimension: {
          include: {
            survey: { select: { id: true, title: true } },
          },
        },
      },
    });
    return usages.map((uq) => ({
      surveyId: uq.dimension.survey.id,
      surveyTitle: uq.dimension.survey.title,
      dimensionId: uq.dimension.id,
      dimensionTitle: uq.dimension.title,
    }));
  }
}
