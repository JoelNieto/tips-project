import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role, RoleDocument } from './schemas/role.schema';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private model: Model<RoleDocument>) {}

  async create(createRoleDto: CreateRoleDto) {
    Logger.log(JSON.stringify(createRoleDto), 'role');
    const created = new this.model(createRoleDto);
    Logger.log(JSON.stringify(created), 'created');
    return await created.save();
  }

  findAll() {
    return this.model.find({});
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
