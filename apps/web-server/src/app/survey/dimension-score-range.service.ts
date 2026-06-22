import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { DimensionScoreRange } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import type { CreateDimensionScoreRangeInput } from './dto/create-dimension-score-range.input';
import type { UpdateDimensionScoreRangeInput } from './dto/update-dimension-score-range.input';

@Injectable()
export class DimensionScoreRangeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    input: CreateDimensionScoreRangeInput,
    userId: string
  ): Promise<DimensionScoreRange> {
    const dimension = await this.prisma.dimension.findUnique({
      where: { id: input.dimensionId },
      include: { survey: { select: { createdById: true } } },
    });
    if (!dimension) {
      throw new NotFoundException(`Dimension with id ${input.dimensionId} not found`);
    }
    if (dimension.survey.createdById !== userId) {
      throw new ForbiddenException(
        'Only the survey creator can add score ranges'
      );
    }
    if (input.maxValue < input.minValue) {
      throw new BadRequestException('maxValue must be greater than or equal to minValue');
    }
    return this.prisma.dimensionScoreRange.create({
      data: {
        dimensionId: input.dimensionId,
        label: input.label ?? undefined,
        message: input.message,
        minValue: input.minValue,
        maxValue: input.maxValue,
        order: input.order ?? undefined,
      },
    });
  }

  async update(
    id: string,
    input: UpdateDimensionScoreRangeInput,
    userId: string
  ): Promise<DimensionScoreRange> {
    const existing = await this.prisma.dimensionScoreRange.findUnique({
      where: { id },
      include: {
        dimension: { include: { survey: { select: { createdById: true } } } },
      },
    });
    if (!existing) {
      throw new NotFoundException(`Score range with id ${id} not found`);
    }
    if (existing.dimension.survey.createdById !== userId) {
      throw new ForbiddenException(
        'Only the survey creator can update score ranges'
      );
    }
    const minValue = input.minValue ?? existing.minValue;
    const maxValue = input.maxValue ?? existing.maxValue;
    if (maxValue < minValue) {
      throw new BadRequestException('maxValue must be greater than or equal to minValue');
    }
    return this.prisma.dimensionScoreRange.update({
      where: { id },
      data: {
        ...(input.label !== undefined && { label: input.label }),
        ...(input.message !== undefined && { message: input.message }),
        ...(input.minValue !== undefined && { minValue: input.minValue }),
        ...(input.maxValue !== undefined && { maxValue: input.maxValue }),
        ...(input.order !== undefined && { order: input.order }),
      },
    });
  }

  async delete(id: string, userId: string): Promise<DimensionScoreRange> {
    const existing = await this.prisma.dimensionScoreRange.findUnique({
      where: { id },
      include: {
        dimension: { include: { survey: { select: { createdById: true } } } },
      },
    });
    if (!existing) {
      throw new NotFoundException(`Score range with id ${id} not found`);
    }
    if (existing.dimension.survey.createdById !== userId) {
      throw new ForbiddenException(
        'Only the survey creator can delete score ranges'
      );
    }
    return this.prisma.dimensionScoreRange.delete({ where: { id } });
  }
}
