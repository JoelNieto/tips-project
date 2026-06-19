import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Question, Prisma, User } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import { AnswerSetService, answerSetInclude } from './answer-set.service';
import type { CreateQuestionInput } from './dto/create-question.input';
import type { UpdateQuestionInput } from './dto/update-question.input';

const questionInclude = {
  createdBy: true,
  answerSet: {
    include: answerSetInclude,
  },
} satisfies Prisma.QuestionInclude;

@Injectable()
export class QuestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly answerSetService: AnswerSetService
  ) {}

  async findAll(createdById?: string): Promise<Question[]> {
    const where: Prisma.QuestionWhereInput = {};
    if (createdById) {
      where.createdById = createdById;
    }
    return this.prisma.question.findMany({
      where,
      include: questionInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Question & { createdBy: User } | null> {
    return this.prisma.question.findUnique({
      where: { id },
      include: questionInclude,
    });
  }

  async create(input: CreateQuestionInput, createdById: string): Promise<Question> {
    const answerSetId = await this.resolveAnswerSetId(input, createdById);

    return this.prisma.question.create({
      data: {
        title: input.title,
        text: input.text,
        weight: input.weight ?? undefined,
        isReversed: input.isReversed ?? false,
        isMultiAnswer: input.isMultiAnswer ?? false,
        createdById,
        answerSetId: answerSetId ?? undefined,
      },
      include: questionInclude,
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

    let answerSetId: string | null | undefined;
    if (input.newAnswerSet) {
      if (input.answerSetId !== undefined) {
        throw new BadRequestException(
          'Cannot specify both answerSetId and newAnswerSet'
        );
      }
      const created = await this.answerSetService.createFromNested(
        input.newAnswerSet,
        userId
      );
      answerSetId = created.id;
    } else if (input.answerSetId !== undefined) {
      if (input.answerSetId) {
        const answerSet = await this.prisma.answerSet.findUnique({
          where: { id: input.answerSetId },
        });
        if (!answerSet) {
          throw new NotFoundException(
            `Answer set with id ${input.answerSetId} not found`
          );
        }
      }
      answerSetId = input.answerSetId;
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
        ...(answerSetId !== undefined && { answerSetId }),
      },
      include: questionInclude,
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

  private async resolveAnswerSetId(
    input: CreateQuestionInput,
    createdById: string
  ): Promise<string | undefined> {
    if (input.answerSetId && input.newAnswerSet) {
      throw new BadRequestException(
        'Cannot specify both answerSetId and newAnswerSet'
      );
    }

    if (input.newAnswerSet) {
      const created = await this.answerSetService.createFromNested(
        input.newAnswerSet,
        createdById
      );
      return created.id;
    }

    if (input.answerSetId) {
      const answerSet = await this.prisma.answerSet.findUnique({
        where: { id: input.answerSetId },
      });
      if (!answerSet) {
        throw new NotFoundException(
          `Answer set with id ${input.answerSetId} not found`
        );
      }
      return input.answerSetId;
    }

    return undefined;
  }
}
