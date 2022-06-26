import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { Position } from './schemas/position.schema';

@Injectable()
export class PositionsService {
  constructor(@InjectModel(Position.name) private model: Model<Position>) {}

  create(createPositionDto: CreatePositionDto) {
    const created = new this.model(createPositionDto);
    return created.save().then((x) => x.populate('company parent'));
  }

  findAll() {
    return this.model.find({});
  }

  findOne(id: string) {
    return this.model.findById(id);
  }

  update(id: string, updatePositionDto: UpdatePositionDto) {
    const { name, code, isPosition, parent } = updatePositionDto;
    return this.model
      .findByIdAndUpdate(id, {
        $set: { name, code, isPosition, parent, updatedAt: new Date() },
      })
      .setOptions({ new: true })
      .populate('company parent');
  }

  remove(id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
