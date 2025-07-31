import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { SiteReadinessService } from './site-readiness.service';
import { CreateSiteReadinessDto } from './dto/create-site-readiness.dto';
import { UpdateSiteReadinessDto } from './dto/update-site-readiness.dto';

@Controller('site-readiness')
export class SiteReadinessController {
  constructor(private readonly siteReadinessService: SiteReadinessService) { }

  @Post()
  create(@Body() createSiteReadinessDto: CreateSiteReadinessDto) {
    return this.siteReadinessService.create(createSiteReadinessDto);
  }
  @Get('blocks-with-readiness')
  getBlocksWithReadiness() {
    return this.siteReadinessService.getBlocksWithReadiness();
  }
  @Get('readiness-activities')
  getReadinessActivityPoints() {
    return this.siteReadinessService.getReadinessActivityPoints();
  }
  
  @Get('block/:id/project')
  async getProjectInfoForBlock(@Param('id') blockId: string) {
    try {
      return await this.siteReadinessService.getProjectInfoForBlock(blockId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get()
  findAll() {
    return this.siteReadinessService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.siteReadinessService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSiteReadinessDto: UpdateSiteReadinessDto) {
    return this.siteReadinessService.update(+id, updateSiteReadinessDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.siteReadinessService.remove(+id);
  }
}
