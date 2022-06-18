import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as models from '@tips/data/models';
import { Document, Schema as mongoSchema } from 'mongoose';

import { ModelBase, SchemaBase } from '../../shared/base.schema';
import { MeasureSchema } from './survey-measure.schema';

export type SurveyDocument = Survey & Document;
@Schema()
export class Survey extends SchemaBase implements ModelBase<models.Survey> {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: false })
  description: string;

  @Prop({ type: mongoSchema.Types.ObjectId, ref: 'SurveyType' })
  type: models.SurveyType;

  @Prop([MeasureSchema])
  measures: models.Measure[];

  @Prop({ type: Boolean, default: true })
  public: boolean;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: Boolean, default: true })
  final: boolean;

  @Prop({ type: mongoSchema.Types.ObjectId, ref: 'User' })
  createdBy: Omit<models.User, 'password'>;
}

export const SurveySchema = SchemaFactory.createForClass(Survey);
