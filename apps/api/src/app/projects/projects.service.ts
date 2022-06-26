import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, ProjectDocument } from './schemas/project.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private model: Model<ProjectDocument>
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    const created = new this.model(createProjectDto);
    const x = await created.save();
    return await x.populate('company');
  }

  findAll() {
    return this.model.find({}).populate('company');
  }

  findOne(id: string) {
    return this.model.findById(id).populate('company');
  }

  update(id: string, updateProjectDto: UpdateProjectDto) {
    const { title, code, description, company, startDate, endDate } =
      updateProjectDto;
    const changes = this.model
      .findByIdAndUpdate(id, {
        $set: {
          title,
          code,
          description,
          company,
          startDate,
          endDate,
          updatedAt: new Date(),
        },
      })
      .setOptions({ new: true })
      .populate('company');
    return changes;
  }

  remove(id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
