import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Position } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import type { CreatePositionInput } from './dto/create-position.input';
import type { UpdatePositionInput } from './dto/update-position.input';

@Injectable()
export class PositionService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCompany(companyId: string): Promise<Position[]> {
    await this.ensureCompanyExists(companyId);

    return this.prisma.position.findMany({
      where: { companyId },
      orderBy: [{ name: 'asc' }],
    });
  }

  async findOne(id: string): Promise<Position | null> {
    return this.prisma.position.findUnique({
      where: { id },
    });
  }

  async create(input: CreatePositionInput): Promise<Position> {
    await this.ensureCompanyExists(input.companyId);

    if (input.parentPositionId) {
      await this.ensureParentPosition(input.parentPositionId, input.companyId);
    }

    return this.prisma.position.create({
      data: {
        name: input.name,
        code: input.code,
        companyId: input.companyId,
        parentPositionId: input.parentPositionId ?? null,
      },
    });
  }

  async update(id: string, input: UpdatePositionInput): Promise<Position> {
    const existing = await this.prisma.position.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Position with id ${id} not found`);
    }

    if (input.parentPositionId !== undefined) {
      if (input.parentPositionId === id) {
        throw new BadRequestException('A position cannot report to itself');
      }

      if (input.parentPositionId) {
        await this.ensureParentPosition(
          input.parentPositionId,
          existing.companyId
        );
        await this.ensureNoCircularReference(id, input.parentPositionId);
      }
    }

    return this.prisma.position.update({
      where: { id },
      data: {
        name: input.name,
        code: input.code,
        parentPositionId: input.parentPositionId,
      },
    });
  }

  async delete(id: string): Promise<Position> {
    const existing = await this.prisma.position.findUnique({
      where: { id },
      include: { childPositions: true },
    });

    if (!existing) {
      throw new NotFoundException(`Position with id ${id} not found`);
    }

    if (existing.childPositions.length > 0) {
      throw new BadRequestException(
        'Cannot delete a position that has child positions'
      );
    }

    return this.prisma.position.delete({
      where: { id },
    });
  }

  private async ensureCompanyExists(companyId: string): Promise<void> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with id ${companyId} not found`);
    }
  }

  private async ensureParentPosition(
    parentPositionId: string,
    companyId: string
  ): Promise<void> {
    const parent = await this.prisma.position.findUnique({
      where: { id: parentPositionId },
    });

    if (!parent) {
      throw new NotFoundException(
        `Parent position with id ${parentPositionId} not found`
      );
    }

    if (parent.companyId !== companyId) {
      throw new BadRequestException(
        'Parent position must belong to the same company'
      );
    }
  }

  private async ensureNoCircularReference(
    positionId: string,
    parentPositionId: string
  ): Promise<void> {
    let currentId: string | null = parentPositionId;

    while (currentId) {
      if (currentId === positionId) {
        throw new BadRequestException(
          'Parent position would create a circular hierarchy'
        );
      }

      const parent = await this.prisma.position.findUnique({
        where: { id: currentId },
        select: { parentPositionId: true },
      });

      currentId = parent?.parentPositionId ?? null;
    }
  }
}
