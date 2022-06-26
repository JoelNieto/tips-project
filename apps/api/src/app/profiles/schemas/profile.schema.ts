import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as models from '@tips/data/models';
import { Document, Schema as mongoSchema } from 'mongoose';

import { ModelBase, SchemaBase } from '../../shared/base.schema';

export type ProfileDocument = Profile & Document;
@Schema()
export class Profile extends SchemaBase implements ModelBase<models.Profile> {
  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true, enum: ['male', 'female', 'other'] })
  gender: 'male' | 'female' | 'other';

  @Prop({ type: Date, required: true })
  birthDate: Date;

  @Prop({ type: String, unique: true, required: true })
  documentId: string;

  @Prop({ type: mongoSchema.Types.ObjectId, ref: 'Company' })
  company: models.Company;

  @Prop({ type: mongoSchema.Types.ObjectId, ref: 'Position' })
  position?: models.Position;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: mongoSchema.Types.ObjectId, ref: 'User' })
  user: models.User;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
