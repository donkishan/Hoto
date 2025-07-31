// masters/projects/projects.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsService } from './services/projects.service';
import { ProjectsController } from './controllers/projects.controller';
import { Project, ProjectSchema } from './schemas/project.schema';
import { PvConfigurationsModule } from './pv-configurations.module'; 
import { TblogsModule } from '../tblogs/tblogs.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    PvConfigurationsModule, 
    TblogsModule
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}