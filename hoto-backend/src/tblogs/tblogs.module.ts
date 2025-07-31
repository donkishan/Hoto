// src/tblogs/tblogs.module.ts
import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TBlog, TBlogSchema } from './schemas/tblogs.schema';
import { TblogsService } from './tblogs.service';
import { TblogsController } from './tblogs.controller';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: TBlog.name, schema: TBlogSchema }])
  ],
  providers: [TblogsService],
  controllers: [TblogsController],
  exports: [TblogsService], // <== ✅ Important if used in other modules
})
export class TblogsModule {}
