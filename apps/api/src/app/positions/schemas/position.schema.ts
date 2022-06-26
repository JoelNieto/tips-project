import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as models from '@tips/data/models';
import { Document, Schema as mongoSchema } from 'mongoose';

import { ModelBase, SchemaBase } from '../../shared/base.schema';

export type PositionDocument = Position & Document;

@Schema()
export class Position extends SchemaBase implements ModelBase<models.Position> {
  @Prop({ type: mongoSchema.Types.ObjectId, ref: 'Company', required: true })
  company: models.Company;

  @Prop({ type: String })
  code: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Boolean })
  isPosition: boolean;

  @Prop({ type: [{ type: mongoSchema.Types.ObjectId, ref: 'Position' }] })
  children: models.Position[];

  @Prop({ type: mongoSchema.Types.ObjectId, ref: 'Position' })
  parent: models.Position;
}

export const PositionSchema = SchemaFactory.createForClass(Position);
