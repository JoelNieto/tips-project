import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as models from '@tips/data/models';
import { Document, Schema as mongoSchema } from 'mongoose';

import { ModelBase, SchemaBase } from '../../shared/base.schema';

export type ProjectDocument = Project & Document;

@Schema()
export class Project extends SchemaBase implements ModelBase<models.Project> {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  code: string;

  @Prop({ type: mongoSchema.Types.ObjectId, ref: 'Company' })
  company?: models.Company;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: mongoSchema.Types.Date })
  startDate: Date;

  @Prop({ type: mongoSchema.Types.Date, required: false })
  endDate?: Date;

  @Prop({ type: Boolean, default: true, required: false })
  active: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
