import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  NotFoundException,
  Req,
  Query
} from '@nestjs/common';
import { Request } from 'express';
import { ProjectsService } from '../services/projects.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { PVConfigService } from '../services/pv-config.service';
import { CreatePvConfigurationDto } from '../dto/create-pv-configuration.dto';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly pvConfigurationsService: PVConfigService
  ) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Req() req: Request) {
    console.log('🚀 Incoming Payload:', JSON.stringify(createProjectDto, null, 2));
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';
    const performedBy = req.headers['x-user-email'] as string || 'system';

    const { pvConfigurations, ...projectData } = createProjectDto;
    const project = await this.projectsService.create(projectData, ip, performedBy);

    if (pvConfigurations && Array.isArray(pvConfigurations)) {
      for (const config of pvConfigurations) {
        await this.pvConfigurationsService.create({
          ...config,
          projectId: project._id.toString(),
        });
      }
    }

    return {
      message: 'Project and PV Configurations saved successfully.',
      projectId: project._id,
    };
  }

  
  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get('projectDataTable')
  projectDataTable(@Query() query: any) {
    return this.projectsService.dataTable(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const project = await this.projectsService.findOne(id);
    if (!project) throw new NotFoundException('Project not found');

    const pvConfigurations = await this.pvConfigurationsService.findByProjectId(id);
    return { project, pvConfigurations };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateProjectDto, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';
    const performedBy = req.headers['x-user-email'] as string || 'system';

    const { pvConfigurations, ...projectData } = updateDto;
    const updatedProject = await this.projectsService.update(id, projectData, ip, performedBy);
    if (!updatedProject) throw new NotFoundException('Project not found');

    // Optionally delete old configurations
    await this.pvConfigurationsService.deleteByProjectId(id);

    // Re-insert new configurations
    if (pvConfigurations && Array.isArray(pvConfigurations)) {
      for (const config of pvConfigurations) {
        await this.pvConfigurationsService.create({
          ...config,
          projectId: id,
        });
      }
    }

    return {
      message: 'Project updated successfully',
      projectId: updatedProject._id,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';
    const performedBy = req.headers['x-user-email'] as string || 'system';

    const deleted = await this.projectsService.remove(id, ip, performedBy);
    if (!deleted) throw new NotFoundException('Project not found');

    await this.pvConfigurationsService.deleteByProjectId(id);

    return { message: 'Project and PV configurations deleted successfully' };
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    const updatedRole = await this.projectsService.toggleStatus(id);
    if (!updatedRole) {
      throw new NotFoundException('User not found');
    }
    return {
      message: 'Status toggled successfully',
      // updated: updatedRole,
    };
  }
}
