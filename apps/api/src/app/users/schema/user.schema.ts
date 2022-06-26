import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as models from '@tips/data/models';
import { Document, Schema as mongooseSchema } from 'mongoose';

import { ModelBase, SchemaBase } from '../../shared/base.schema';

export type UserDocument = User & Document;

@Schema()
export class User extends SchemaBase implements ModelBase<models.User> {
  @Prop({ type: String, required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ required: false, type: mongooseSchema.Types.ObjectId, ref: 'Role' })
  role: models.Role;

  @Prop({ type: Boolean, default: false })
  isAdmin: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
