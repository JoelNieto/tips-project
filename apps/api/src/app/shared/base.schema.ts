import { Prop } from '@nestjs/mongoose';

export class SchemaBase {
  @Prop({ type: Date, required: true, default: Date.now })
  createdAt: Date | undefined;

  @Prop({ type: Date, required: true, default: Date.now })
  updatedAt: Date | undefined;
}

export type DTOBase<T> = Omit<
  T,
  '_id' | 'createdAt' | 'updatedAt' | 'createdBy'
>;
export type ModelBase<T> = Omit<T, '_id'>;
