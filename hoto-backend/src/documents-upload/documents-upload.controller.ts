import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DocumentsUploadService } from './documents-upload.service';
import { CreateDocumentsUploadDto } from './dto/create-documents-upload.dto';

@Controller('documents-upload')
export class DocumentsUploadController {
  constructor(private readonly documentsUploadService: DocumentsUploadService) {}

  @Post()
  create(@Body() createDto: CreateDocumentsUploadDto) {
    return this.documentsUploadService.create(createDto);
  }

  @Get()
  async findAll(@Query('projectId') projectId?: string) {
    if (projectId) {
      return this.documentsUploadService.findByProjectId(projectId);
    }
    return this.documentsUploadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsUploadService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateDocumentsUploadDto>) {
    return this.documentsUploadService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentsUploadService.remove(id);
  }
}
