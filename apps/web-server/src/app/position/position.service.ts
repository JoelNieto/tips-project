import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Position } from '@generated/prisma';
import { PrismaService } from '../prisma.service';
import type { AuthUserContext } from '../auth/auth-policy.service';
import { AuthPolicyService } from '../auth/auth-policy.service';
import type { CreatePositionInput } from './dto/create-position.input';
import type { UpdatePositionInput } from './dto/update-position.input';

@Injectable()
export class PositionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authPolicy: AuthPolicyService
  ) {}

  async findByCompany(
    companyId: string,
    user: AuthUserContext
  ): Promise<Position[]> {
    await this.authPolicy.assertCompanyAccess(user, companyId);

    return this.prisma.position.findMany({
      where: { companyId },
      orderBy: [{ name: 'asc' }],
    });
  }

  async findOne(id: string, user: AuthUserContext): Promise<Position | null> {
    const position = await this.prisma.position.findUnique({
      where: { id },
    });

    if (!position) {
      return null;
    }

    await this.authPolicy.assertCompanyAccess(user, position.companyId);
    return position;
  }

  async create(input: CreatePositionInput, user: AuthUserContext): Promise<Position> {
    await this.authPolicy.assertCompanyAccess(user, input.companyId);

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

  async update(
    id: string,
    input: UpdatePositionInput,
    user: AuthUserContext
  ): Promise<Position> {
    const existing = await this.prisma.position.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Position with id ${id} not found`);
    }

    await this.authPolicy.assertCompanyAccess(user, existing.companyId);

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

  async delete(id: string, user: AuthUserContext): Promise<Position> {
    const existing = await this.prisma.position.findUnique({
      where: { id },
      include: { childPositions: true },
    });

    if (!existing) {
      throw new NotFoundException(`Position with id ${id} not found`);
    }

    await this.authPolicy.assertCompanyAccess(user, existing.companyId);

    if (existing.childPositions.length > 0) {
      throw new BadRequestException(
        'Cannot delete a position that has child positions'
      );
    }

    return this.prisma.position.delete({
      where: { id },
    });
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
