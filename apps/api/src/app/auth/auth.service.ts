import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { Model } from 'mongoose';

import { User, UserDocument } from '../users/schema/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private model: Model<UserDocument>,
    private readonly configService: ConfigService,
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
    return {
      email: user.email,
      username: user.username,
      role: user.role,
      _id: user._id,
    };
  }

  public getJWTCookie(payload: Partial<User>) {
    const token = this.jwt.sign(payload);
    return `Authentication=${token}; Path=/; Max-Age=${this.configService.get(
      'JWT_EXPIRATION'
    )}`;
  }
}
