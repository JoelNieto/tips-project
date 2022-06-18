import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateSurveyMeasureDto } from '../dto/create-survey-measure.dto';
import { UpdateSurveyMeasureDto } from '../dto/update-survey-measure.dto';
import { MeasureDocument, SurveyMeasure } from '../schemas/survey-measure.schema';

@Injectable()
export class SurveyMeasuresService {
  constructor(
    @InjectModel(SurveyMeasure.name) private model: Model<MeasureDocument>
  ) {}

  async create(dto: CreateSurveyMeasureDto) {
    Logger.log(dto, 'dto');
    const created = new this.model(dto);
    return await created.save();
  }

  findAll() {
    return this.model.find({}).populate('questions');
  }

  findOne(id: string) {
    return this.model.findById(id).populate('questions');
  }

  update(id: number, updateSurveyMeasureDto: UpdateSurveyMeasureDto) {
    return `This action updates a #${id} surveyMeasure`;
  }

  remove(id: number) {
    return `This action removes a #${id} surveyMeasure`;
  }
}
