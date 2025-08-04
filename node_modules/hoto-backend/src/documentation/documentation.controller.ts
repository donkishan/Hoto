import { Controller, Get, Post, Body, Param, Delete, Query , Put} from '@nestjs/common';
import { DocumentationService } from './documentation.service';

@Controller('documentation')
export class DocumentationController {
  constructor(private readonly documentationService: DocumentationService) {}

  @Post()
  create(@Body() payload: any) {
    return this.documentationService.create(payload);
  }

  @Get()
  findAll() {
    return this.documentationService.findAll();
  }

  @Get('datatable')
  getDataTable(@Query() query: any) {
    return this.documentationService.getDataTable(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentationService.findOne(id);
  }
  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.documentationService.update(id, updateDto);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentationService.remove(id);
  }
}
