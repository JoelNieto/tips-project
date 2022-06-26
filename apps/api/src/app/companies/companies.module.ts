import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Position, PositionSchema } from '../positions/schemas/position.schema';
import { Profile, ProfileSchema } from '../profiles/schemas/profile.schema';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { Company, CompanySchema } from './schemas/company.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: Position.name, schema: PositionSchema },
      { name: Profile.name, schema: ProfileSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
