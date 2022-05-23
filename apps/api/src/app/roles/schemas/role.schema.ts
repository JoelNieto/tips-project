import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as models from '@tips/data/models';
import { Document } from 'mongoose';

import { ModelBase } from '../../shared/base.schema';

export type RoleDocument = Role & Document;

@Schema()
export class Role implements ModelBase<models.Role> {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ required: false, default: false, type: Boolean })
  admin: boolean;
}

export const RolesSchema = SchemaFactory.createForClass(Role);
