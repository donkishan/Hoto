import { Injectable } from '@nestjs/common';
import { CreateBlockDetailDto } from './dto/create-block-detail.dto';
import { UpdateBlockDetailDto } from './dto/update-block-detail.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SiteReadinessImage } from './schemas/site-readiness-image.schema';
import { SiteReadinessStatus } from './schemas/site-readiness-status.schema';
import { Model } from 'mongoose';

@Injectable()
export class BlockDetailsService {
  constructor(
    @InjectModel(SiteReadinessStatus.name)
    private readonly statusModel: Model<SiteReadinessStatus>,
    @InjectModel(SiteReadinessImage.name)
    private readonly imageModel: Model<SiteReadinessImage>
  ) { }
  
  async saveSubmission(
    data: any,
    files: { certificate?: Express.Multer.File[]; image?: Express.Multer.File[] }
  ) {
    const now = new Date();
    const certificateFile = files?.certificate?.[0];
    const imageFiles = files?.image || [];

    // 1. Update or create status document
    const existingStatus = await this.statusModel.findOne({
      project_id: data.project_id,
      block_id: data.block_id,
      site_readiness_activity_id: data.site_readiness_activity_id,
      is_deleted: false
    });

    if (existingStatus) {
      existingStatus.status = data.status;
      if (certificateFile) {
        existingStatus.certificate = certificateFile.filename;
      }
      existingStatus.updated_at = now;
      await existingStatus.save();
    } else {
      const newStatus = new this.statusModel({
        project_id: data.project_id,
        block_id: data.block_id,
        site_readiness_activity_id: data.site_readiness_activity_id,
        status: data.status,
        certificate: certificateFile?.filename,
        is_deleted: false,
        created_at: now,
        updated_at: now,
      });
      await newStatus.save();
    }

    // 2. Handle image upload and merge
    if (imageFiles.length > 0) {
      const newFilenames = imageFiles.map(f => f.filename);
      const newOriginalNames = imageFiles.map(f => f.originalname);

      const existingImageDoc = await this.imageModel.findOne({
        project_id: data.project_id,
        block_id: data.block_id,
        site_readiness_activity_id: data.site_readiness_activity_id,
        is_deleted: false,
      });

      if (existingImageDoc) {
        existingImageDoc.image_name = [...new Set([...(existingImageDoc.image_name || []), ...newFilenames])];
        existingImageDoc.image_original_name = [...new Set([...(existingImageDoc.image_original_name || []), ...newOriginalNames])];
        existingImageDoc.updated_at = now;
        await existingImageDoc.save();
      } else {
        const imageDoc = new this.imageModel({
          project_id: data.project_id,
          block_id: data.block_id,
          site_readiness_activity_id: data.site_readiness_activity_id,
          image_name: newFilenames,
          image_original_name: newOriginalNames,
          is_deleted: false,
          created_at: now,
          updated_at: now,
        });
        await imageDoc.save();
      }
    }

    return { message: 'Submission saved or updated successfully' };
  }

  async getReadinessData(projectId: string, blockId: string) {
    const statuses = await this.statusModel.find({
      project_id: projectId,
      block_id: blockId,
      is_deleted: false,
    }).lean();

    const images = await this.imageModel.find({
      project_id: projectId,
      block_id: blockId,
      is_deleted: false,
    }).lean();

    return { statuses, images };
  }

  async getCompletedReadinessPoints(projectId: string, blockId: string) {
    return this.statusModel.find({
      project_id: projectId,
      block_id: blockId,
      status: 'COMPLETED',
      is_deleted: false
    }).lean();
  }

  create(createBlockDetailDto: CreateBlockDetailDto) {
    return 'This action adds a new blockDetail';
  }

  findAll() {
    return `This action returns all blockDetails`;
  }

  findOne(id: number) {
    return `This action returns a #${id} blockDetail`;
  }

  update(id: number, updateBlockDetailDto: UpdateBlockDetailDto) {
    return `This action updates a #${id} blockDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} blockDetail`;
  }
}
