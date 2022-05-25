import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateAnswerSetDto } from '../dto/create-answer-set.dto';
import { UpdateAnswerSetDto } from '../dto/update-answer-set.dto';
import { AnswerSet, AnswerSetDocument } from '../schemas/answer-set.schema';

@Injectable()
export class AnswerSetsService {
  constructor(
    @InjectModel(AnswerSet.name) private model: Model<AnswerSetDocument>
  ) {}

  async create(dto: CreateAnswerSetDto) {
    const created = new this.model(dto);
    return await created.save();
  }

  findAll() {
    return this.model.find({});
  }

  findOne(id: string) {
    return this.model.findById(id);
  }

  async update(id: string, dto: UpdateAnswerSetDto) {
    const { name, answers } = dto;

    const updated = await this.model
      .findByIdAndUpdate(id, {
        $set: {
          name,
          answers,
          updatedAt: new Date(),
        },
      })
      .setOptions({ new: true });

    return updated;
  }

  async remove(id: string) {
    return await this.model.findByIdAndDelete(id);
  }
}
