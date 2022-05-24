import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { getEnvPath } from '../common/helper/env.helper';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { SurveyCategoriesModule } from './survey-categories/survey-categories.module';
import { SurveyTypesModule } from './survey-types/survey-types.module';
import { SurveysModule } from './surveys/surveys.module';
import { UsersModule } from './users/users.module';

const envFilePath = getEnvPath(`${process.cwd()}/src/common/envs`);
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: envFilePath, isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    SurveysModule,
    SurveyCategoriesModule,
    SurveyTypesModule,
  ],
})
export class AppModule {}
