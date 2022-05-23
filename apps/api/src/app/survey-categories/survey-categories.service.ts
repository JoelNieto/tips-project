import { Injectable } from '@nestjs/common';
import { CreateSurveyCategoryDto } from './dto/create-survey-category.dto';
import { UpdateSurveyCategoryDto } from './dto/update-survey-category.dto';

@Injectable()
export class SurveyCategoriesService {
  create(createSurveyCategoryDto: CreateSurveyCategoryDto) {
    return 'This action adds a new surveyCategory';
  }

  findAll() {
    return `This action returns all surveyCategories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} surveyCategory`;
  }

  update(id: number, updateSurveyCategoryDto: UpdateSurveyCategoryDto) {
    return `This action updates a #${id} surveyCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} surveyCategory`;
  }
}
