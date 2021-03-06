import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { Model } from 'mongoose';

import { User, UserDocument } from '../users/schema/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private model: Model<UserDocument>,
    private readonly jwt: JwtService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.model.findOne({ email }).populate('role');

    if (!user) {
      return null;
    }

    if (await compare(password, user.password)) {
      return user;
    }
  }

  async login(user: UserDocument) {
    Logger.log(JSON.stringify(user), 'user');
    const payload = {
      email: user.email,
      username: user.username,
      role: user.role,
      _id: user._id,
    };

    return { access_token: this.jwt.sign(payload) };
  }
}
