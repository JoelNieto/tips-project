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
    return await created.save().then((x) => x.populate('type'));
  }

  findAll() {
    return this.model.find({}).populate('type');
  }

  findOne(id: string) {
    return this.model.findById(id);
  }

  async update(id: string, dto: UpdateSurveyDto) {
    const { title, description, measures, type, final } = dto;

    const updated = await this.model
      .findByIdAndUpdate(id, {
        $set: {
          title,
          description,
          measures,
          type,
          final,
          updatedAt: new Date(),
        },
      })
      .setOptions({ new: true })
      .populate('type');
    return updated;
  }

  remove(id: string) {
    return `This action removes a #${id} survey`;
  }
}
