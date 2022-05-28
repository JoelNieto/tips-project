import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateSurveyDto } from '../dto/create-survey.dto';
import { UpdateSurveyDto } from '../dto/update-survey.dto';
import { Survey, SurveyDocument } from '../schemas/survey.schemas';

@Injectable()
export class SurveysService {
  constructor(@InjectModel(Survey.name) private model: Model<SurveyDocument>) {}

  async create(createSurveyDto: CreateSurveyDto) {
    const created = new this.model(createSurveyDto);
    return await created.save();
  }

  findAll() {
    return this.model.find({}).populate('type');
  }

  findOne(id: string) {
    return this.model.findById(id);
  }

  update(id: string, updateSurveyDto: UpdateSurveyDto) {
    return `This action updates a #${id} survey`;
  }

  remove(id: string) {
    return `This action removes a #${id} survey`;
  }
}
