
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Req,
  Query 
} from '@nestjs/common';
import { Request } from 'express';
import { HotoRequestsService } from './hoto-requests.service';
import { CreateHotoRequestDto } from './dto/create-hoto-request.dto';
import { UpdateHotoRequestDto } from './dto/update-hoto-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';

@Controller('hoto-requests')
export class HotoRequestsController {
  constructor(private readonly hotoRequestsService: HotoRequestsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('certificate', {
      storage: diskStorage({
        destination: './uploads/hoto-certificates',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )

  async create(
    @UploadedFile() certificate: Express.Multer.File,
    @Body('formData') formDataRaw: string,
    @Body('blocks') blocksRaw: string,
    @Req() req: Request,
  ) {
    try {
      const formData: CreateHotoRequestDto = JSON.parse(formDataRaw);
      const performedBy = (req.headers['x-user-email'] as string) || 'system';

      const blocks = JSON.parse(blocksRaw);
      console.log('📦 Final Payload:', {
      formData,
      blocks,
      certificatePath: certificate?.path,
      ipAddress: req.ip,
      performedBy
    });

      return this.hotoRequestsService.create({
        ...formData,
        blocks,
        certificatePath: certificate?.path || '',
        ipAddress: req.ip,
        performedBy,
      });
    } catch (error) {
      console.error('Error parsing request body:', error);
      throw new HttpException('Invalid request format', HttpStatus.BAD_REQUEST);
    }
  }

  @Get("requestDataTable")
  async requestDataTable(@Query() query: any) {
    const result = await this.hotoRequestsService.dataTable(query);
    return {
      draw: parseInt(query.draw || '1'),
      ...result
    };
  }


  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.hotoRequestsService.findOne(id,'');
  }

  @Get('division-wise/:id/:divisionId')
  async findByDivision(
    @Param('id') id: string,
    @Param('divisionId') divisionId: string
  ) {
    return this.hotoRequestsService.findByDivision(id, divisionId);
  }
  
  // Route for HOTO request + Block ID (single block)
  @Get(':id/:blockId')
  async findOneBlock(
    @Param('id') id: string,
    @Param('blockId') blockId: string
  ) {
    return this.hotoRequestsService.findOne(id, blockId);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('certificate', {
      storage: diskStorage({
        destination: './uploads/hoto-certificates',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )

  async update(
    @Param('id') id: string,
    @UploadedFile() certificate: Express.Multer.File,
    @Body('formData') formDataRaw: string,
    @Body('blocks') blocksRaw: string,
    @Req() req: Request,
  ) {
    try {
      const formData: UpdateHotoRequestDto = JSON.parse(formDataRaw);
      const performedBy = (req.headers['x-user-email'] as string) || 'system';

      const blocks = JSON.parse(blocksRaw);

      return this.hotoRequestsService.update(id, {
        ...formData,
        blocks,
        certificatePath: certificate?.path || '',
        ipAddress: req.ip,
        performedBy,
      });
    } catch (error) {
      console.error('Error parsing update request:', error);
      
      throw new HttpException('Invalid update request format', HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const record = await this.hotoRequestsService.findOne(id,'');

    // Delete associated file if it exists
    if (record?.certificatePath && fs.existsSync(record.certificatePath)) {
      fs.unlinkSync(record.certificatePath);
    }

    return this.hotoRequestsService.remove(
      id,
      req.ip,
      req.headers['x-user-email']?.toString() || 'system',
    );
  }


}
