import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateQuestionDto } from '../dto/create-question.dto';
import { UpdateQuestionDto } from '../dto/update-question.dto';
import { Question, QuestionDocument } from '../schemas/question.schema';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private model: Model<QuestionDocument>
  ) {}

  async create(dto: CreateQuestionDto) {
    const created = new this.model(dto);
    return await created.save();
  }

  findAll() {
    return this.model.find({});
  }

  findOne(id: string) {
    return this.model.findById(id);
  }

  async update(id: string, dto: UpdateQuestionDto) {
    const { title, text, reverse, weighting, answersSet, multiAnswer } = dto;

    const updated = await this.model
      .findByIdAndUpdate(id, {
        $set: {
          title,
          text,
          reverse,
          weighting,
          answersSet,
          multiAnswer,
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
