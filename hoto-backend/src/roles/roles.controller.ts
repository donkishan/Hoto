import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, NotFoundException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesQueryDto } from './dto/roles-query.dto';
import { Role } from './schemas/role.schema';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    const result  = await  this.rolesService.create(createRoleDto);
     return {
      statusCode: 201,
      message: 'Role created successfully.',
      data: result,
    };

  }

  @Get()
  async findAll(@Query() query: RolesQueryDto) {
    const result = await this.rolesService.findAll(query);
    return {
      draw: parseInt(query.draw || '1'),
      ...result,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);  // keep as string
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    const updatedRole = await this.rolesService.toggleStatus(id);
    if (!updatedRole) {
      throw new NotFoundException('Role not found');
    }
    return {
      message: 'Status toggled successfully',
      updated: updatedRole,
    };
  }
  
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deletedRole = await this.rolesService.remove(id);
    if (!deletedRole) {
      throw new NotFoundException(`Role with ID ${id} not found or already deleted`);
    }    
    return {
      message: 'Role deleted successfully',      
    };
  }

  @Get('byDivision/:divisionId')
  async getRolesByDivision(@Param('divisionId') divisionId: string): Promise<Role[]> {
    return this.rolesService.findByDivision(divisionId);
  }
}
