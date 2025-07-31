// src/tblogs/tblogs.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TBlog, TBlogDocument } from './schemas/tblogs.schema';
@Injectable()
export class TblogsService {
  constructor(@InjectModel(TBlog.name) private tblogModel: Model<TBlogDocument>) {}

  async logAction(data: {
  module: string;
  module_id: string;
  action: string;
  ipAddress: string;
  performedBy: string; // ✅ added
  remarks?: string;
  rawData?: any;

}): Promise<TBlog> {
  // console.log('📦 Logging action:', data); 
  const log = new this.tblogModel(data);
  return log.save();
}


  async findAll(): Promise<TBlog[]> {
    return this.tblogModel.find().sort({ createdAt: -1 }).exec();
  }
}
