import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as models from '@tips/data/models';
import { Document } from 'mongoose';

import { ModelBase, SchemaBase } from '../../shared/base.schema';

export type AnswerSetDocument = AnswerSet & Document;

@Schema()
export class AnswerSet
  extends SchemaBase
  implements ModelBase<models.AnswersSet>
{
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: Array, default: [] })
  answers: models.Answer[];
}

export const AnswerSetSchema = SchemaFactory.createForClass(AnswerSet);
