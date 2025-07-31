import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TeamMobilisationService } from './team-mobilisation.service';
import { CreateTeamMobilisationDto } from './dto/create-team-mobilisation.dto';
import { UpdateTeamMobilisationDto } from './dto/update-team-mobilisation.dto';

@Controller('team-mobilisation')
export class TeamMobilisationController {
  constructor(private readonly teamMobilisationService: TeamMobilisationService) {}

  @Post()
  create(@Body() createTeamMobilisationDto: CreateTeamMobilisationDto) {
    return this.teamMobilisationService.create(createTeamMobilisationDto);
  }

  @Get()
  findAll() {
    return this.teamMobilisationService.findAll();
  }

  @Get('requests')
  async getRequests() {
    return await this.teamMobilisationService.getHotoRequests(); // 👉 returns all from Compass
  }

  @Get('requests/:id')
  async getRequestById(@Param('id') id: string) {
    return await this.teamMobilisationService.getHotoRequestById(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamMobilisationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeamMobilisationDto: UpdateTeamMobilisationDto) {
    return this.teamMobilisationService.update(+id, updateTeamMobilisationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamMobilisationService.remove(+id);
  }
}
