import { Prop, SchemaFactory } from '@nestjs/mongoose';
import * as models from '@tips/data/models';
import { Document } from 'mongoose';

import { ModelBase, SchemaBase } from '../../shared/base.schema';
import { QuestionSchema } from './question.schema';

export type MeasureDocument = SurveyMeasure & Document;

export class SurveyMeasure
  extends SchemaBase
  implements ModelBase<models.Measure>
{
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: Number })
  weighting: number;

  @Prop({ type: Array })
  subMeasures: models.Measure[];

  @Prop({ type: QuestionSchema })
  mainQuestion: models.Question;

  @Prop({ type: [QuestionSchema] })
  questions: models.Question[];
}

export const MeasureSchema = SchemaFactory.createForClass(SurveyMeasure);
