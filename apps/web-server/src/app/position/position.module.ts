import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { PositionResolver } from './position.resolver';
import { PositionService } from './position.service';

@Module({
  imports: [PrismaModule],
  providers: [PositionResolver, PositionService],
  exports: [PositionService],
})
export class PositionModule {}
