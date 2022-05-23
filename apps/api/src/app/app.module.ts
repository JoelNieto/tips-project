import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { environment } from '../environments/environment';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { SurveysModule } from './surveys/surveys.module';
import { SurveyCategoriesModule } from './survey-categories/survey-categories.module';
import { SurveyTypesModule } from './survey-types/survey-types.module';

@Module({
  imports: [
    MongooseModule.forRoot(environment.mongoDBUri),
    AuthModule,
    UsersModule,
    RolesModule,
    SurveysModule,
    SurveyCategoriesModule,
    SurveyTypesModule,
  ],
})
export class AppModule {}
