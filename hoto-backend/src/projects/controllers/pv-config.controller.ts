import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PVConfigService } from '../services/pv-config.service';
import { CreatePvConfigurationDto } from '../dto/create-pv-configuration.dto';
import { PvConfiguration } from '../schemas/pv-config.schema';

@Controller('pv-configs')
export class PVConfigController {
  constructor(private readonly pvConfigService: PVConfigService) {}

  // @Get(':projectId')
  // getByProject(@Param('projectId') projectId: string) {
  //   return this.pvConfigService.getByProject(projectId);
  // }

  // @Post()
  // create(@Body() data: any) {
  //   return this.pvConfigService.create(data);
  // }
   // ✅ Get all PV configs for a given project
  @Get(':projectId')
  async getByProject(@Param('projectId') projectId: string): Promise<PvConfiguration[]> {
    return this.pvConfigService.getByProject(projectId);
  }

  // ✅ Create a new PV config (used by backend or direct API call)
  @Post()
  async create(@Body() data: CreatePvConfigurationDto): Promise<PvConfiguration> {
    return this.pvConfigService.create(data);
  }
}

