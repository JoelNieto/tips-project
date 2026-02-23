import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { MainQuestionAnswer } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import type { CreateMainQuestionAnswerInput } from './dto/create-main-question-answer.input';
import type { UpdateMainQuestionAnswerInput } from './dto/update-main-question-answer.input';

@Injectable()
export class MainQuestionAnswerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    input: CreateMainQuestionAnswerInput,
    userId: string
  ): Promise<MainQuestionAnswer> {
    const dimension = await this.prisma.dimension.findUnique({
      where: { id: input.dimensionId },
      include: { survey: { select: { createdById: true } } },
    });
    if (!dimension) {
      throw new NotFoundException(`Dimension with id ${input.dimensionId} not found`);
    }
    if (dimension.survey.createdById !== userId) {
      throw new ForbiddenException(
        'Only the survey creator can add main question answers'
      );
    }
    return this.prisma.mainQuestionAnswer.create({
      data: {
        dimensionId: input.dimensionId,
        text: input.text,
        sortOrder: input.sortOrder ?? undefined,
        value: input.value,
        reverseValue: input.reverseValue ?? undefined,
      },
    });
  }

  async update(
    id: string,
    input: UpdateMainQuestionAnswerInput,
    userId: string
  ): Promise<MainQuestionAnswer> {
    const existing = await this.prisma.mainQuestionAnswer.findUnique({
      where: { id },
      include: {
        dimension: { include: { survey: { select: { createdById: true } } } },
      },
    });
    if (!existing) {
      throw new NotFoundException(
        `Main question answer with id ${id} not found`
      );
    }
    if (existing.dimension.survey.createdById !== userId) {
      throw new ForbiddenException(
        'Only the survey creator can update main question answers'
      );
    }
    return this.prisma.mainQuestionAnswer.update({
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

  async delete(id: string, userId: string): Promise<MainQuestionAnswer> {
    const existing = await this.prisma.mainQuestionAnswer.findUnique({
      where: { id },
      include: {
        dimension: { include: { survey: { select: { createdById: true } } } },
      },
    });
    if (!existing) {
      throw new NotFoundException(
        `Main question answer with id ${id} not found`
      );
    }
    if (existing.dimension.survey.createdById !== userId) {
      throw new ForbiddenException(
        'Only the survey creator can delete main question answers'
      );
    }
    return this.prisma.mainQuestionAnswer.delete({ where: { id } });
  }
}
