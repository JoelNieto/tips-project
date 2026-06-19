import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AnswerSet, Prisma, User } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import type { CreateAnswerSetInput } from './dto/create-answer-set.input';
import type { UpdateAnswerSetInput } from './dto/update-answer-set.input';
import type { AnswerNestedInput } from './dto/answer-nested.input';

export const answerSetInclude = {
  createdBy: true,
  answers: { orderBy: { sortOrder: 'asc' as const } },
} satisfies Prisma.AnswerSetInclude;

@Injectable()
export class AnswerSetService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(createdById?: string): Promise<AnswerSet[]> {
    const where: Prisma.AnswerSetWhereInput = {};
    if (createdById) {
      where.createdById = createdById;
    }
    return this.prisma.answerSet.findMany({
      where,
      include: answerSetInclude,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(
    id: string
  ): Promise<(AnswerSet & { createdBy: User }) | null> {
    return this.prisma.answerSet.findUnique({
      where: { id },
      include: answerSetInclude,
    });
  }

  async create(
    input: CreateAnswerSetInput,
    createdById: string
  ): Promise<AnswerSet> {
    return this.prisma.answerSet.create({
      data: {
        name: input.name,
        description: input.description ?? undefined,
        createdById,
        answers: input.answers?.length
          ? { create: this.mapAnswers(input.answers) }
          : undefined,
      },
      include: answerSetInclude,
    });
  }

  async update(
    id: string,
    input: UpdateAnswerSetInput,
    userId: string
  ): Promise<AnswerSet> {
    const existing = await this.prisma.answerSet.findUnique({
      where: { id },
      include: { _count: { select: { questions: true } } },
    });
    if (!existing) {
      throw new NotFoundException(`Answer set with id ${id} not found`);
    }
    if (existing.createdById !== userId) {
      throw new ForbiddenException('Only the creator can update this answer set');
    }

    if (input.answers !== undefined) {
      return this.prisma.$transaction(async (tx) => {
        await tx.answer.deleteMany({ where: { answerSetId: id } });
        if (input.answers?.length) {
          await tx.answer.createMany({
            data: input.answers.map((a, i) => ({
              answerSetId: id,
              text: a.text,
              sortOrder: a.sortOrder ?? i,
              value: a.value,
              reverseValue: a.reverseValue ?? undefined,
            })),
          });
        }
        return tx.answerSet.update({
          where: { id },
          data: {
            ...(input.name !== undefined && { name: input.name }),
            ...(input.description !== undefined && {
              description: input.description,
            }),
          },
          include: answerSetInclude,
        });
      });
    }

    return this.prisma.answerSet.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
      },
      include: answerSetInclude,
    });
  }

  async delete(id: string, userId: string): Promise<AnswerSet> {
    const existing = await this.prisma.answerSet.findUnique({
      where: { id },
      include: { _count: { select: { questions: true } } },
    });
    if (!existing) {
      throw new NotFoundException(`Answer set with id ${id} not found`);
    }
    if (existing.createdById !== userId) {
      throw new ForbiddenException('Only the creator can delete this answer set');
    }
    if (existing._count.questions > 0) {
      throw new BadRequestException(
        'Cannot delete an answer set that is used by questions'
      );
    }
    return this.prisma.answerSet.delete({ where: { id } });
  }

  async createFromNested(
    input: { name: string; description?: string; answers: AnswerNestedInput[] },
    createdById: string
  ): Promise<AnswerSet> {
    return this.prisma.answerSet.create({
      data: {
        name: input.name,
        description: input.description ?? undefined,
        createdById,
        answers: input.answers.length
          ? { create: this.mapAnswers(input.answers) }
          : undefined,
      },
      include: answerSetInclude,
    });
  }

  private mapAnswers(answers: AnswerNestedInput[]) {
    return answers.map((a, i) => ({
      text: a.text,
      sortOrder: a.sortOrder ?? i,
      value: a.value,
      reverseValue: a.reverseValue ?? undefined,
    }));
  }
}
