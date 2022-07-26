import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as models from '@tips/data/models';
import mongoose, { Document } from 'mongoose';

import { ModelBase, SchemaBase } from '../../shared/base.schema';

export type AssignmentDocument = Assignment & Document;

@Schema()
export class Assignment
  extends SchemaBase
  implements ModelBase<models.Assignment>
{
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Project' })
  project?: models.Project;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company' })
  company?: models.Company;

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Survey' })
  survey?: models.Survey;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Position' }])
  positions: models.Position[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }])
  profiles: models.Profile[];
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
