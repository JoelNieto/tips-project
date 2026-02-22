import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { SurveyType, Prisma, User } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import type { CreateSurveyTypeInput } from './dto/create-survey-type.input';
import type { UpdateSurveyTypeInput } from './dto/update-survey-type.input';

@Injectable()
export class SurveyTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(createdById?: string): Promise<SurveyType[]> {
    const where: Prisma.SurveyTypeWhereInput = {};
    if (createdById) {
      where.createdById = createdById;
    }
    return this.prisma.surveyType.findMany({
      where,
      include: { createdBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(
    id: string
  ): Promise<(SurveyType & { createdBy: User }) | null> {
    return this.prisma.surveyType.findUnique({
      where: { id },
      include: { createdBy: true },
    });
  }

  async create(input: CreateSurveyTypeInput, createdById: string) {
    return this.prisma.surveyType.create({
      data: {
        name: input.name,
        description: input.description ?? undefined,
        code: input.code ?? undefined,
        isActive: input.isActive ?? true,
        categoryName: input.categoryName ?? undefined,
        subcategoryName: input.subcategoryName ?? undefined,
        hasCategories: input.hasCategories ?? false,
        hasSubcategories: input.hasSubcategories ?? false,
        visibleCategories: input.visibleCategories ?? false,
        visibleSubcategories: input.visibleSubcategories ?? false,
        randomizeQuestions: input.randomizeQuestions ?? false,
        createdById,
      },
      include: { createdBy: true },
    });
  }

  async update(
    id: string,
    input: UpdateSurveyTypeInput,
    userId: string
  ): Promise<SurveyType & { createdBy: User }> {
    const existing = await this.prisma.surveyType.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Survey type with id ${id} not found`);
    }
    if (existing.createdById !== userId) {
      throw new ForbiddenException(
        'Only the creator can update this survey type'
      );
    }
    return this.prisma.surveyType.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.code !== undefined && { code: input.code }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.categoryName !== undefined && {
          categoryName: input.categoryName,
        }),
        ...(input.subcategoryName !== undefined && {
          subcategoryName: input.subcategoryName,
        }),
        ...(input.hasCategories !== undefined && {
          hasCategories: input.hasCategories,
        }),
        ...(input.hasSubcategories !== undefined && {
          hasSubcategories: input.hasSubcategories,
        }),
        ...(input.visibleCategories !== undefined && {
          visibleCategories: input.visibleCategories,
        }),
        ...(input.visibleSubcategories !== undefined && {
          visibleSubcategories: input.visibleSubcategories,
        }),
        ...(input.randomizeQuestions !== undefined && {
          randomizeQuestions: input.randomizeQuestions,
        }),
      },
      include: { createdBy: true },
    });
  }

  async delete(id: string, userId: string): Promise<SurveyType> {
    const existing = await this.prisma.surveyType.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Survey type with id ${id} not found`);
    }
    if (existing.createdById !== userId) {
      throw new ForbiddenException(
        'Only the creator can delete this survey type'
      );
    }
    return this.prisma.surveyType.delete({
      where: { id },
    });
  }
}
