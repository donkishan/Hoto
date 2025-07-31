import { Injectable } from '@nestjs/common';
import { CreateSiteReadinessDto } from './dto/create-site-readiness.dto';
import { UpdateSiteReadinessDto } from './dto/update-site-readiness.dto';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';

@Injectable()
export class SiteReadinessService {
  constructor(@InjectConnection() private readonly connection: Connection) { }
  async getBlocksWithReadiness() {
    const blocks = await this.connection.collection('hoto_request_block').find().toArray();
    const readinessPoints = await this.connection.collection('site_readiness_activity').find().toArray();

    return {
      blocks,
      readinessPoints,
    };
  }

  async getProjectInfoForBlock(blockId: string) {
    const block = await this.connection.collection('hoto_request_block').findOne({ _id: new Types.ObjectId(blockId) });

    if (!block) {
      throw new Error('Block not found');
    }

    const project = await this.connection.collection('hotorequest').findOne({ _id: block.hoto_request_id });

    return {
      block,
      project,
    };
  }

  async getReadinessActivityPoints() {
    return this.connection
      .collection('site_readiness_activity')
      .find({}, { projection: { _id: 1, name: 1 } })
      .toArray();
  }

  create(createSiteReadinessDto: CreateSiteReadinessDto) {
    return 'This action adds a new siteReadiness';
  }

  findAll() {
    return `This action returns all siteReadiness`;
  }

  findOne(id: number) {
    return `This action returns a #${id} siteReadiness`;
  }

  update(id: number, updateSiteReadinessDto: UpdateSiteReadinessDto) {
    return `This action updates a #${id} siteReadiness`;
  }

  remove(id: number) {
    return `This action removes a #${id} siteReadiness`;
  }
}
