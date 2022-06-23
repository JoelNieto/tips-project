import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as models from '@tips/data/models';
import { Document } from 'mongoose';

import { ModelBase, SchemaBase } from '../../shared/base.schema';

export type CompanyDocument = Company & Document;

@Schema()
export class Company extends SchemaBase implements ModelBase<models.Company> {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false })
  fullName: string;

  @Prop({ type: String, required: false })
  notes?: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
