import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as models from '@tips/data/models';
import { Document } from 'mongoose';

import { ModelBase, SchemaBase } from '../../shared/base.schema';
import { AnswerSetSchema } from './answer-set.schema';

export type QuestionDocument = Question & Document;

@Schema()
export class Question extends SchemaBase implements ModelBase<models.Question> {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  text: string;

  @Prop({ type: Boolean })
  reverse: boolean;

  @Prop({ type: Number })
  weighting: number;

  @Prop({ type: Boolean })
  multiAnswer: boolean;

  @Prop({ type: AnswerSetSchema })
  answersSet: models.AnswersSet;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
