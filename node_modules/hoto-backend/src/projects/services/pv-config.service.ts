import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PvConfiguration, PvConfigurationDocument } from '../schemas/pv-config.schema';
import { CreatePvConfigurationDto } from '../dto/create-pv-configuration.dto';

@Injectable()
export class PVConfigService {
  constructor(
    @InjectModel(PvConfiguration.name) private pvModel: Model<PvConfigurationDocument>,
  ) {}

  async getByProject(projectId: string) {
    return this.pvModel.find({ projectId: new Types.ObjectId(projectId) }).exec();
  }

  async create(data: CreatePvConfigurationDto) {
    const created = new this.pvModel({
      ...data,
      projectId: new Types.ObjectId(data.projectId), //  Convert string to ObjectId
    });
    return created.save();
  }

  async findByProjectId(projectId: string) {
  return this.pvModel.find({ projectId: new Types.ObjectId(projectId) }).exec();
}
  async deleteByProjectId(projectId: string) {
    return this.pvModel.deleteMany({ projectId: new Types.ObjectId(projectId) }).exec();
  }

}
