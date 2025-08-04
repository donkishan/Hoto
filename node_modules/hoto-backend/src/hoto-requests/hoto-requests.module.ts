
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HotoRequestsService } from './hoto-requests.service';
import { HotoRequestsController } from './hoto-requests.controller';
import { Block, BlockSchema } from './schemas/block.schema';
import { HotoRequest, HotoRequestSchema } from './schemas/hoto-requests.schema';
import { TblogsModule } from '../tblogs/tblogs.module';
import { Division, DivisionSchema } from '../divisions/schemas/division.schema';
import { MailerModule } from '@nestjs-modules/mailer';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HotoRequest.name, schema: HotoRequestSchema },
      { name: Block.name, schema: BlockSchema },
      { name: Division.name, schema: DivisionSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
    TblogsModule,
    MailerModule,
  ],
  controllers: [HotoRequestsController],
  providers: [HotoRequestsService],
})
export class HotoRequestsModule {}
