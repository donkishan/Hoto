import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PunchPointService } from './services/punch-point.service';
import { PunchPointController } from './controllers/punch-point.controller';
import { PunchPoint, PunchPointSchema } from './schemas/punch-point.schema';
import { TblogsModule } from '../tblogs/tblogs.module';
import { UploadLog, UploadLogSchema } from './schemas/upload-log.schema';
import { HotoRequest, HotoRequestSchema } from '../hoto-requests/schemas/hoto-requests.schema';
import { Block, BlockSchema } from '../hoto-requests/schemas/block.schema';
import { UploadStatusLog, UploadStatusLogSchema } from './schemas/upload-status-log.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PunchPoint.name, schema: PunchPointSchema },
      { name: UploadLog.name, schema: UploadLogSchema },
      { name: HotoRequest.name, schema: HotoRequestSchema },
      { name: Block.name, schema: BlockSchema },
      { name: UploadStatusLog.name, schema: UploadStatusLogSchema },

    ]),
    TblogsModule,
  ],
  controllers: [PunchPointController],
  providers: [PunchPointService],
})
export class PunchPointModule {}
