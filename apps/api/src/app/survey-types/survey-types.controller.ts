import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateSurveyTypeDto } from './dto/create-survey-type.dto';
import { UpdateSurveyTypeDto } from './dto/update-survey-type.dto';
import { SurveyTypesService } from './survey-types.service';

@ApiTags('Survey types')
@Controller('survey-types')
export class SurveyTypesController {
  constructor(private readonly surveyTypesService: SurveyTypesService) {}

  @Post()
  create(@Body() createSurveyTypeDto: CreateSurveyTypeDto) {
    return this.surveyTypesService.create(createSurveyTypeDto);
  }

  @Get()
  findAll() {
    return this.surveyTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.surveyTypesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSurveyTypeDto: UpdateSurveyTypeDto
  ) {
    return this.surveyTypesService.update(id, updateSurveyTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.surveyTypesService.remove(id);
  }
}
