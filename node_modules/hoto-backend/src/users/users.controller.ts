import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  NotFoundException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  create(@Body() dto: CreateUserDto, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';

    const performedBy = req.headers['x-user-email'] as string || 'system';

    return this.usersService.create(dto, ip, performedBy);
  }


  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('userDataTable')
  userDataTable(@Query() query: any) {
    return this.usersService.dataTable(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

 @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request
  ) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';

    const performedBy = req.headers['x-user-email'] as string || 'system';

    return this.usersService.update(id, updateUserDto, ip, performedBy);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';

    const performedBy = req.headers['x-user-email'] as string || 'system';

    const deletedUser = await this.usersService.remove(id, ip, performedBy);

    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found or already deleted`);
    }    
    return {
      message: 'User deleted successfully',      
    };
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    const updatedRole = await this.usersService.toggleStatus(id);
    if (!updatedRole) {
      throw new NotFoundException('User not found');
    }
    return {
      message: 'Status toggled successfully',
      // updated: updatedRole,
    };
  }

  
}
