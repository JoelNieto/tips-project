import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from '../users/schema/user.schema';
import { UsersService } from '../users/users.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile, ProfileDocument } from './schemas/profile.schema';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profile.name) private model: Model<ProfileDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    private user: UsersService
  ) {}

  create(createProfileDto: CreateProfileDto) {
    const { firstName, lastName, email, documentId } = createProfileDto;
    const user = new this.userModel({
      username: `${firstName} ${lastName}`,
      email,
      password: documentId,
    });
    user.save();
    const profile = { ...createProfileDto, user };
    const created = new this.model(profile);
    return created.save().then((x) => x.populate('company position'));
  }

  findAll() {
    return this.model.find({}).populate('company position');
  }

  findOne(id: string) {
    return this.model.findById(id);
  }

  update(id: string, updateProfileDto: UpdateProfileDto) {
    const {
      firstName,
      lastName,
      gender,
      documentId,
      birthDate,
      position,
      company,
      active,
    } = updateProfileDto;

    const update = this.model
      .findByIdAndUpdate(id, {
        $set: {
          firstName,
          lastName,
          gender,
          documentId,
          birthDate,
          position,
          company,
          active,
          updatedAt: new Date(),
        },
      })
      .setOptions({ new: true })
      .populate('position company');
    return update;
  }

  remove(id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
