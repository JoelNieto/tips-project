import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company, CompanyDocument } from './schemas/company.schema';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private model: Model<CompanyDocument>
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
}
