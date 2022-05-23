import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SurveyCategoriesService } from './survey-categories.service';
import { CreateSurveyCategoryDto } from './dto/create-survey-category.dto';
import { UpdateSurveyCategoryDto } from './dto/update-survey-category.dto';

@Controller('survey-categories')
export class SurveyCategoriesController {
  constructor(
    private readonly surveyCategoriesService: SurveyCategoriesService
  ) {}

  @Post()
  create(@Body() createSurveyCategoryDto: CreateSurveyCategoryDto) {
    return this.surveyCategoriesService.create(createSurveyCategoryDto);
  }

  @Get()
  findAll() {
    return this.surveyCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.surveyCategoriesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSurveyCategoryDto: UpdateSurveyCategoryDto
  ) {
    return this.surveyCategoriesService.update(+id, updateSurveyCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.surveyCategoriesService.remove(+id);
  }
}
