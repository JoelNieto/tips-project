import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateSurveyTypeDto } from './dto/create-survey-type.dto';
import { UpdateSurveyTypeDto } from './dto/update-survey-type.dto';
import { SurveyType, SurveyTypeDocument } from './schemas/survey-type.schema';

@Injectable()
export class SurveyTypesService {
  constructor(
    @InjectModel(SurveyType.name) private model: Model<SurveyTypeDocument>
  ) {}

  async create(createSurveyTypeDto: CreateSurveyTypeDto) {
    const created = new this.model(createSurveyTypeDto);
    return await created.save();
  }

  findAll() {
    return this.model.find({});
  }

  findOne(id: string) {
    return this.model.findById(id);
  }

  async update(id: string, updateSurveyTypeDto: UpdateSurveyTypeDto) {
    const {
      name,
      hasRadar,
      hasBar,
      hasMeasureQuestion,
      prefix,
      measureName,
      subMeasureName,
      instructions,
      isRandom,
    } = updateSurveyTypeDto;

    const updated = await this.model
      .findByIdAndUpdate(id, {
        $set: {
          name,
          hasRadar,
          hasBar,
          hasMeasureQuestion,
          prefix,
          measureName,
          subMeasureName,
          instructions,
          isRandom,
          updatedAt: new Date(),
        },
      })
      .setOptions({ new: true });

    if (!updated) {
      throw new NotFoundException();
    }

    return updated;
  }

  async remove(id: string) {
    return await this.model.findByIdAndDelete(id);
  }
}
