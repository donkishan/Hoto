import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentationService } from './documentation.service';
import { DocumentationController } from './documentation.controller';
import { DocumentationSchema } from './schema/documentation.schema';

import { ProjectsModule } from '../projects/projects.module';

import { DivisionsModule } from '../divisions/divisions.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Documentation', schema: DocumentationSchema }]),
    ProjectsModule,
    DivisionsModule
  ],
  controllers: [DocumentationController],
  providers: [DocumentationService],
  exports: [MongooseModule] ,
})
export class DocumentationModule {}
