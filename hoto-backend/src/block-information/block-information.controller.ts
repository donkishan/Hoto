import { Controller, Get, Post, Body, Patch, Put, Param, Delete, Query, NotFoundException } from '@nestjs/common';
import { BlockInformationService } from './block-information.service';
import { CreateBlockInformationDto } from './dto/create-block-information.dto';
import { UpdateBlockInformationDto } from './dto/update-block-information.dto';
import { AssignUsersDto } from './dto/assign-users.dto';


@Controller('block-information')
export class BlockInformationController {
  constructor(private readonly blockInformationService: BlockInformationService) {}

  @Post()
  create(@Body() createBlockInformationDto: CreateBlockInformationDto) {
    return this.blockInformationService.create(createBlockInformationDto);
  }

  @Post('add-member')
  async addMember(@Body() body: any) {
    return this.blockInformationService.addMemberToUserCollection(body);
  }

  @Get('user-by-role')
  async findUsersByRoleOrType() {
    const result = await this.blockInformationService.findUsersByRoleOrType();
    return { success: true, data: result }; // Wrap in JSON object
  }

  @Get('datatable-members')
  async getUsersForDataTable(@Query() query: any) {
    const result = await this.blockInformationService.findUsersForDataTable(query);
    return {
      draw: parseInt(query.draw || '1'),
      ...result,
    };
  }

  @Post(':blockId/add-member')
  addMemberToBlock(
   @Body() dto: AssignUsersDto
  ) {
    return this.blockInformationService.addMemberToBlock(dto);
  }

  @Post(':blockId/delete-member')
  deleteMemberToBlock(
    @Body() dto: AssignUsersDto
  ) {
    return this.blockInformationService.deleteMember(dto);
  }

  @Post(':blockId/remove-member')
  removeMemberToBlock(
    @Body() dto: AssignUsersDto
  ) {
    return this.blockInformationService.removeMember(dto);
  }
  
  @Put('update-member/:id')
  async updateMember(
    @Param('id') id: string,
    @Body() body: any
  ) {
    return this.blockInformationService.updateMember(id, body);
  }
  
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blockInformationService.remove(id);
  }

  @Post(':blockId/request-acknowledgement')
  async requestAcknowledgement(
    @Param('blockId') blockId: string,
    @Body('userId') userId: string,
    @Body('divisionId') divisionId: string
  ) {
    const result = await this.blockInformationService.requestAcknowledgement(blockId, userId,divisionId);
    if (!result) {
      throw new NotFoundException('Block not found');
    }
    return { message: 'Acknowledgement requested successfully.' };
  }

  @Post(':blockId/acknowledge')
  async acknowledge(
    @Param('blockId') blockId: string,
    @Body('userId') userId: string,
    @Body('divisionId') divisionId: string
  ) {
    const result = await this.blockInformationService.acknowledge(blockId, userId,divisionId);
    if (!result) {
      throw new NotFoundException('Block not found');
    }
    return { message: 'Acknowledgement requested successfully.' };
  }

  @Post('punch-point-status')
  async updatePunchPointStatus(
    @Body('blockId') blockId: string,
    @Body('userId') userId: string,
    @Body('divisionId') divisionId: string
  ) {
    const result = await this.blockInformationService.upadtePunchPointStatus(blockId, userId,divisionId);
    if (!result) {
      throw new NotFoundException('Block not found');
    }
    return { message: 'Acknowledgement requested successfully.' };
  }
}
