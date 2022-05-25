import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as models from '@tips/data/models';
import { Document, Schema as mongoSchema } from 'mongoose';

import { ModelBase, SchemaBase } from '../../shared/base.schema';

export type SurveyTypeDocument = SurveyType & Document;

@Schema()
export class SurveyType
  extends SchemaBase
  implements ModelBase<models.SurveyType>
{
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: Boolean })
  hasRadar: boolean;

  @Prop({ type: Boolean })
  hasBar: boolean;

  @Prop({ type: Boolean })
  hasMeasureQuestion: boolean;

  @Prop({ type: String })
  prefix: string;

  @Prop({ type: String })
  measureName: string;

  @Prop({ type: String })
  subMeasureName: string;

  @Prop({ type: Boolean })
  visibleMeasures: boolean;

  @Prop({ type: String })
  instructions?: string;

  @Prop({ type: Boolean })
  isRandom: boolean;

  @Prop({ type: mongoSchema.Types.ObjectId, ref: 'User' })
  createdBy: Omit<models.User, 'password'>;
}

export const SurveyTypeSchema = SchemaFactory.createForClass(SurveyType);
