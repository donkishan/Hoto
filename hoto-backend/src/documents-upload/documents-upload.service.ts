import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDocumentsUploadDto } from './dto/create-documents-upload.dto';

@Injectable()
export class DocumentsUploadService {
  constructor(
    @InjectModel('DocumentsUpload') private readonly docUploadModel: Model<any>,
  ) {}

  async create(createDto: CreateDocumentsUploadDto): Promise<any> {
  const { documentId, projectId, uploadedLinks } = createDto;

  // Ensure every uploaded link has a status
  const linksWithStatus = uploadedLinks.map(linkObj => ({
    link: linkObj.link,
    status: linkObj.status || 'pending'
  }));

  const existing = await this.docUploadModel.findOne({ documentId, projectId });

  if (existing) {
    existing.uploadedLinks = linksWithStatus;
    existing.uploadedCount = createDto.uploadedCount;
    existing.acceptedByOM = createDto.acceptedByOM;
    existing.rejectedByOM = createDto.rejectedByOM;
    return existing.save();
  }

  const doc = new this.docUploadModel({
    ...createDto,
    uploadedLinks: linksWithStatus
  });

  return doc.save();
}


  async findAll(): Promise<any[]> {
    return this.docUploadModel.find().exec();
  }

  async findByProjectId(projectId: string): Promise<any[]> {
    return this.docUploadModel.find({ projectId }).exec();
  }

  async findOne(id: string): Promise<any> {
    return this.docUploadModel.findById(id).exec();
  }

  async update(id: string, updateDto: Partial<CreateDocumentsUploadDto>): Promise<any> {
    return this.docUploadModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any> {
    return this.docUploadModel.findByIdAndDelete(id).exec();
  }
}
