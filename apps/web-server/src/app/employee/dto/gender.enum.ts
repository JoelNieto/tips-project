import { registerEnumType } from '@nestjs/graphql';
import { Gender } from '@generated/prisma';

export { Gender };

registerEnumType(Gender, {
  name: 'Gender',
});
