import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { genSalt, hash } from 'bcrypt';

import { User, UserSchema } from './schema/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;
          schema.pre<any>('save', function (next) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const user = this;
            if (this.isModified('password') || this.isNew) {
              genSalt(10, (saltError, salt) => {
                if (saltError) {
                  return next(saltError);
                } else {
                  hash(user.password, salt, (hashError, hash) => {
                    if (hashError) {
                      return next(hashError);
                    }
                    user.password = hash;
                    next();
                  });
                }
              });
            } else {
              return next();
            }
          });
          return schema;
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [MongooseModule],
})
export class UsersModule {}
