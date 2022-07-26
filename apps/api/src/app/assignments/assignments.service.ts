import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { Assignment, AssignmentDocument } from './schemas/assignment.schema';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectModel(Assignment.name) private model: Model<AssignmentDocument>
  ) {}

  create(createAssignmentDto: CreateAssignmentDto) {
    const created = new this.model(createAssignmentDto);
    return created
      .save()
      .then((x) => x.populate('project company positions survey'));
  }

  findAll() {
    return this.model.find({}).populate('project company positions survey');
  }

  findOne(id: string) {
    return this.model.findById(id).populate('project company positions survey');
  }

  update(id: string, updateAssignmentDto: UpdateAssignmentDto) {
    const {
      title,
      description,
      profiles,
      project,
      company,
      positions,
      startDate,
      endDate,
    } = updateAssignmentDto;
    const updated = this.model
      .findByIdAndUpdate(id, {
        $set: {
          title,
          description,
          profiles,
          project,
          company,
          positions,
          startDate,
          endDate,
          updatedAt: new Date(),
        },
      })
      .setOptions({ new: true })
      .populate('project company positions survey');
    return updated;
  }

  remove(id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
