import { Module } from '@nestjs/common';
import { SurveyTypeResolver } from './survey-type.resolver';
import { SurveyTypeService } from './survey-type.service';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SurveyTypeResolver, SurveyTypeService],
  exports: [SurveyTypeService],
})
export class SurveyModule {}
