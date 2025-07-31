
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HotoRequestsService } from './hoto-requests.service';
import { HotoRequestsController } from './hoto-requests.controller';
import { Block, BlockSchema } from './schemas/block.schema';
import { HotoRequest, HotoRequestSchema } from './schemas/hoto-requests.schema';
import { TblogsModule } from '../tblogs/tblogs.module';
import { Division, DivisionSchema } from '../divisions/schemas/division.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HotoRequest.name, schema: HotoRequestSchema },
      { name: Block.name, schema: BlockSchema },
      { name: Division.name, schema: DivisionSchema },
    ]),
    TblogsModule,
  ],
  controllers: [HotoRequestsController],
  providers: [HotoRequestsService],
})
export class HotoRequestsModule {}
