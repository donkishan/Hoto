// src/files/files.controller.ts
import { Controller, Get, Query, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { normalize, resolve } from 'path';
import { existsSync } from 'fs';

@Controller('files')
export class FilesController {
  @Get()
  async getFile(@Query('path') path: string, @Res() res: Response) {
    if (!path) throw new NotFoundException('File path is required');

    const safePath = normalize(path).replace(/^(\.\.(\/|\\|$))+/, '');
    const filePath = resolve('uploads', safePath); 

    if (!existsSync(filePath)) {
      throw new NotFoundException(`File not found: ${safePath}`);
    }

    return res.sendFile(filePath);
  }
}
