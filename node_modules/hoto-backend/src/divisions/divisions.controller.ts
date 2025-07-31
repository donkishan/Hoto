import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DivisionsService } from './divisions.service';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { DivisionsQueryDto } from './dto/division-query.dto';

@Controller('divisions')
export class DivisionsController {
  constructor(private readonly divisionsService: DivisionsService) {}

  @Post()
  create(@Body() createDivisionDto: CreateDivisionDto) {
    return this.divisionsService.create(createDivisionDto);
  }

  @Get()
  findAll() {
    return this.divisionsService.findAll();
  }

  @Get('divisionDataTable')
  async divisionDataTable(@Query() query: DivisionsQueryDto) {
    return this.divisionsService.dataTable(query);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.divisionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDivisionDto: UpdateDivisionDto) {
    return this.divisionsService.update(id, updateDivisionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.divisionsService.remove(id);
  }
}
