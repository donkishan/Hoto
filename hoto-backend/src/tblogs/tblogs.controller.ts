import { Controller, Get } from '@nestjs/common';
import { TblogsService } from './tblogs.service';

@Controller('tblogs')
export class TblogsController {
  constructor(private readonly tblogsService: TblogsService) {}

  @Get()
  async findAll() {
    return this.tblogsService.findAll();
  }
}
