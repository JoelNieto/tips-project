import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Answer } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import type { CreateAnswerInput } from './dto/create-answer.input';
import type { UpdateAnswerInput } from './dto/update-answer.input';

@Injectable()
export class AnswerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateAnswerInput, userId: string): Promise<Answer> {
    const question = await this.prisma.question.findUnique({
      where: { id: input.questionId },
    });
    if (!question) {
      throw new NotFoundException(`Question with id ${input.questionId} not found`);
    }
    if (question.createdById !== userId) {
      throw new ForbiddenException(
        'Only the question creator can add answers'
      );
    }
    return this.prisma.answer.create({
      data: {
        questionId: input.questionId,
        text: input.text,
        sortOrder: input.sortOrder ?? undefined,
        value: input.value,
        reverseValue: input.reverseValue ?? undefined,
      },
    });
  }

  async update(
    id: string,
    input: UpdateAnswerInput,
    userId: string
  ): Promise<Answer> {
    const existing = await this.prisma.answer.findUnique({
      where: { id },
      include: { question: { select: { createdById: true } } },
    });
    if (!existing) {
      throw new NotFoundException(`Answer with id ${id} not found`);
    }
    if (existing.question.createdById !== userId) {
      throw new ForbiddenException(
        'Only the question creator can update answers'
      );
    }
    return this.prisma.answer.update({
      where: { id },
      data: {
        ...(input.text !== undefined && { text: input.text }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
        ...(input.value !== undefined && { value: input.value }),
        ...(input.reverseValue !== undefined && {
          reverseValue: input.reverseValue,
        }),
      },
    });
  }

  async delete(id: string, userId: string): Promise<Answer> {
    const existing = await this.prisma.answer.findUnique({
      where: { id },
      include: { question: { select: { createdById: true } } },
    });
    if (!existing) {
      throw new NotFoundException(`Answer with id ${id} not found`);
    }
    if (existing.question.createdById !== userId) {
      throw new ForbiddenException(
        'Only the question creator can delete answers'
      );
    }
    return this.prisma.answer.delete({ where: { id } });
  }
}
