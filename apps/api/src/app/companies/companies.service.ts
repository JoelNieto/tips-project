import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { Position, PositionDocument } from '../positions/schemas/position.schema';
import { Profile, ProfileDocument } from '../profiles/schemas/profile.schema';
import { Project, ProjectDocument } from '../projects/schemas/project.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company, CompanyDocument } from './schemas/company.schema';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private model: Model<CompanyDocument>,
    @InjectModel(Position.name) private positions: Model<PositionDocument>,
    @InjectModel(Profile.name) private profiles: Model<ProfileDocument>,
    @InjectModel(Project.name) private projects: Model<ProjectDocument>
  ) {}

  create(createCompanyDto: CreateCompanyDto) {
    const created = new this.model(createCompanyDto);
    return created.save();
  }

  findAll() {
    return this.model.find({});
  }

  findOne(id: string) {
    return this.model.findById(id);
  }

  update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const { name, fullName, notes } = updateCompanyDto;
    const updated = this.model
      .findByIdAndUpdate(id, {
        $set: {
          name,
          fullName,
          notes,
          updatedAt: new Date(),
        },
      })
      .setOptions({ new: true });
    return updated;
  }

  remove(id: string) {
    return this.model.findByIdAndDelete(id);
  }

  getPositions(id: string) {
    return this.positions
      .find({ company: new mongoose.Types.ObjectId(id) })
      .populate('company parent');
  }

  getProfiles(id: string) {
    return this.profiles
      .find({ company: new mongoose.Types.ObjectId(id) })
      .populate('company position');
  }

  getProjects(id: string) {
    return this.projects
      .find({ company: new mongoose.Types.ObjectId(id) })
      .populate('company');
  }
}
