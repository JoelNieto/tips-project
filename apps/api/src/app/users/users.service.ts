import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}
  async create(createUserDto: CreateUserDto) {
    const created = new this.model(createUserDto);
    return await (await created.save()).populate('role');
  }

  findAll() {
    return this.model.find({}, { password: 0 });
  }

  findOne(id: string) {
    return this.model.findById(id).populate('role');
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { username, email, password } = updateUserDto;
    const changed = await this.model
      .findByIdAndUpdate(id, {
        $set: {
          username,
          email,
          password,
          updatedAt: new Date(),
        },
      })
      .setOptions({ new: true })
      .populate('role');

    if (!changed) {
      throw new NotFoundException();
    }
    return changed;
  }

  async remove(id: string) {
    return await this.model.findByIdAndDelete(id);
  }
}
