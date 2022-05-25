import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateSurveyMeasureDto } from '../dto/create-survey-measure.dto';
import { UpdateSurveyMeasureDto } from '../dto/update-survey-measure.dto';
import { SurveyMeasuresService } from '../services/survey-measures.service';

@ApiTags('Survey Measures')
@Controller('survey-measures')
export class SurveyMeasuresController {
  constructor(private readonly surveyMeasuresService: SurveyMeasuresService) {}

  @Post()
  create(@Body() createSurveyMeasureDto: CreateSurveyMeasureDto) {
    return this.surveyMeasuresService.create(createSurveyMeasureDto);
  }

  @Get()
  findAll() {
    return this.surveyMeasuresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.surveyMeasuresService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSurveyMeasureDto: UpdateSurveyMeasureDto
  ) {
    return this.surveyMeasuresService.update(+id, updateSurveyMeasureDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.surveyMeasuresService.remove(+id);
  }
}
