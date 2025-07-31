import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseInterceptors, UploadedFile, BadRequestException, NotFoundException, Query, Put} from '@nestjs/common';
import { PunchPointService } from '../services/punch-point.service';
import { CreatePunchPointDto } from '../dto/create-punch-point.dto';
import { UpdatePunchPointDto } from '../dto/update-punch-point.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { Types } from 'mongoose';
import { join } from 'path';
import { v4 as uuid } from 'uuid';
import { existsSync, mkdirSync } from 'fs';
import { UploadPunchPointDto } from '../dto/upload-punch-point.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';

// ✅ Custom Multer options to store file in `uploads/` folder
const multerOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `punch-upload-${uniqueSuffix}${ext}`);
    },
  }),
};

@Controller('punch-points')
export class PunchPointController {
  constructor(private readonly punchPointService: PunchPointService) {}
  
  @Get('upload-logs')
  getUploadLogs(@Query() query: any) {
    return this.punchPointService.getUploadLogs(query);
  }

  @Get('status/upload-logs')
  getUploadStatusLogs(@Query() query: any) {
    return this.punchPointService.getUploadStatusLogs(query);
  }

  @Post()
  create(@Body() createDto: CreatePunchPointDto) {
    return this.punchPointService.create(createDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadExcel(@UploadedFile() file: Express.Multer.File,@Body() body: UploadPunchPointDto) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    if (!file.originalname.toLowerCase().endsWith('.xlsx')) {
      throw new BadRequestException('Only .xlsx files are allowed.');
    }

    return this.punchPointService.importFromExcel(file, body);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.punchPointService.findAll(req.query);
  }
  
  @Get('sample')
  async downloadSample(@Res() res: Response) {
    const filePath = await this.punchPointService.generateSampleExcel();
    return res.download(filePath);
  }

  @Get('downlaod_excel')
  async downloadExcel(@Query() query: any, @Res() res: Response) {
    const filePath = await this.punchPointService.downloadExcel(query); // <-- Pass query
    return res.download(filePath, 'punch-point-for-project-block.xlsx');
  }

  @Get('downlaod_excel_for_status')
  async downloadExcelStatus(@Query() query: any, @Res() res: Response) {
    const filePath = await this.punchPointService.downloadExcelStatus(query); // <-- Pass query
    return res.download(filePath, 'punch-point-for-project-status.xlsx');
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.punchPointService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePunchPointDto) {
    return this.punchPointService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.punchPointService.remove(id);
  }

  @Post('upsert')
  async upsertMultiple(@Body() data: CreatePunchPointDto[]) {
    console.log('Received punch points:', data); // ✅ log to debug
    const formatted = data.map((item) => {
      const converted: any = {
        ...item,
      };

      if (item._id) {
        converted._id = new Types.ObjectId(item._id);
      }

      if (item.blockId) {
        
        converted.blockId = new Types.ObjectId(item.blockId);
      }

      if (item.divisionId) {
        converted.divisionId = new Types.ObjectId(item.divisionId);
      }

      return converted;
    });

    return this.punchPointService.upsertMultiple(formatted);
  }

  async bulkUpdateStatusCategory(
    @UploadedFile() file: Express.Multer.File,
    @Body('blockId') blockId: string,
    @Body('divisionId') divisionId?: string,
  ) {
    console.log('✅ Received blockId:', blockId); // These were logging undefined
    console.log('✅ Received divisionId:', divisionId);
    return this.punchPointService.bulkUpdateStatusCategory(file, blockId, divisionId);
  }

  @Patch(':id/update-category')
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const updated = await this.punchPointService.updateCategory(id, dto);
    if (!updated) throw new NotFoundException('PunchPoint not found');
    return { message: 'Category updated successfully' };
  }

  
  @Patch(':id/update-status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    const updated = await this.punchPointService.updateStatus(id, dto);
    if (!updated) throw new NotFoundException('PunchPoint not found');
    return { message: 'Category updated successfully' };
  }

  @Post('upload-project-team-excel')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/project-team',
        filename: (_, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    return this.punchPointService.processExcel(file.path, file.originalname, body);
  }

  @Post('acknowledge')
  acknowledgeByBlock(@Body() body:any) {
    return this.punchPointService.acknowledgeByBlock(body);
  }

  @Post('upload-project-team-status')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/project-team',
        filename: (_, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  async uploadStatusFile(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    return this.punchPointService.processStatusExcel(file.path, file.originalname, body);
  }
}


