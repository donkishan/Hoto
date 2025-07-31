import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { isValidObjectId, Model, Types } from 'mongoose';
import { RolesQueryDto } from './dto/roles-query.dto';
import { formatDateDMY } from '../common/utils/date-utils';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    
    const existingRole = await this.roleModel.findOne({
      role_name: { $regex: `^${createRoleDto.role_name}$`, $options: 'i' },
      mst_divisions_id: createRoleDto.mst_divisions_id
    });


    if (existingRole) {
      throw new BadRequestException(`Role "${createRoleDto.role_name}" already exists.`);
    }

    const now  = Date();
    const createdRole = new this.roleModel({
      ...createRoleDto,   
      create_date: now,
      last_update: now,
      is_active: true,      
      is_delete: false,
    });
    return createdRole.save();
  }

  async findAll(query: RolesQueryDto) {
    const {
      start = '0',
      length = '10',
      ['search[value]']: search = '',
      ['order[0][column]']: sortColumn = '0',
      ['columns[0][data]']: firstColumn = 'role_name',
    } = query;

    const skip = parseInt(start);
    const limit = parseInt(length);

    const baseMatch: any = { is_delete: false };

    const searchMatch: any[] = [];
    if (search) {
      searchMatch.push(
        { role_name: { $regex: search, $options: 'i' } },
        { 'division.divisionCode': { $regex: search, $options: 'i' } },
        { 'division.divisionName': { $regex: search, $options: 'i' } }
      );
    }

    const pipeline: any[] = [
      { $match: baseMatch },
      {
        $addFields: {
          mst_divisions_obj_id: { $toObjectId: '$mst_divisions_id' }
        }
      },
      {
        $lookup: {
          from: 'divisions',
          localField: 'mst_divisions_obj_id',
          foreignField: '_id',
          as: 'division'
        }
      },
      { $unwind: { path: '$division', preserveNullAndEmptyArrays: true } },

      ...(search
        ? [{ $match: { $or: searchMatch } }]
        : []),

      { $sort: { [firstColumn]: 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          role_name: 1,
          is_active: 1,
          create_date: 1,
          division_name: '$division.divisionName',
          division_code: '$division.divisionCode'
        }
      }
    ];

    const roles = await this.roleModel.aggregate(pipeline);

    const countMatch: any[] = [
      { $match: baseMatch },
      {
        $addFields: {
          mst_divisions_obj_id: { $toObjectId: '$mst_divisions_id' }
        }
      },
      {
        $lookup: {
          from: 'divisions',
          localField: 'mst_divisions_obj_id',
          foreignField: '_id',
          as: 'division'
        }
      },
      { $unwind: { path: '$division', preserveNullAndEmptyArrays: true } },
      ...(search ? [{ $match: { $or: searchMatch } }] : []),
      { $count: 'count' }
    ];

    const countResult = await this.roleModel.aggregate(countMatch);
    const recordsFiltered = countResult[0]?.count || 0;
    const recordsTotal = await this.roleModel.countDocuments(baseMatch);

    const dataArr = roles.map(role => ({
      _id: `<input type="checkbox" class="select-row" data-id="${role._id}" />`,
      division: role.division_code + " - " + role.division_name,
      role_name: role.role_name,
      is_active: role.is_active
        ? `<span class="badge badge-label badge-soft-success">Active</span>`
        : `<span class="badge badge-label badge-soft-warning">In-active</span>`,
      create_date: role.create_date
        ? formatDateDMY(role.create_date)
        : '',
      actions: `
        <button class="btn btn-sm btn-icon btn-sm rounded-circle btn-purple edit-role" data-id="${role._id}" data-division_id="${role.mst_divisions_id}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit Role">
          <i class="ti ti-edit"></i> 
        </button>
        <button class="btn btn-sm btn-icon btn-sm rounded-circle ${role.is_active ? 'btn-success' : 'btn-warning'} toggle-role" data-id="${role._id}" data-status="${role.is_active}" 
        data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Click To In-active">
          ${role.is_active ? '<i class="ti ti-check"></i>' : '<i class="ti ti-cancel fs-lg"></i>'}
        </button>
        <button class="btn btn-sm btn-icon btn-sm rounded-circle btn-danger delete-role" data-id="${role._id}"
        data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Click To Delete"><i class="ti ti-trash"></i></button>
      `
    }));

    return {
      data: dataArr,
      recordsTotal,
      recordsFiltered,
    };
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    return this.roleModel.findById(id);
  }
  
  async update(id: string, updateRoleDto: UpdateRoleDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid Role ID');
    }

    const existing = await this.roleModel.findOne({
      role_name: updateRoleDto.role_name,
      _id: { $ne: id }, // exclude current record
    });

    if (existing) {
      throw new ConflictException('Role name already exists');
    }

    const updated = await this.roleModel.findByIdAndUpdate(id, updateRoleDto, {
      new: true,
    });

    if (!updated) {
      throw new NotFoundException('Role not found');
    }

    return updated;
  }

  async toggleStatus(id: string): Promise<Role | null> {
    const role = await this.roleModel.findById(id).exec();

    if (!role) return null;

    role.is_active = !role.is_active;
    await role.save();

    return role.toObject();
  }

  async remove(id: string) {
    
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Role with ID ${id} not found or already deleted`);
    }

    const role = await this.roleModel.findOne({
      _id: new Types.ObjectId(id),
      is_delete: false, // assumes this is a Boolean field
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found or already deleted`);
    }

    role.is_delete = true;
    return role.save();

  }

  async findByDivision(divisionId: string): Promise<Role[]> {
    return this.roleModel.find({
      mst_divisions_id: divisionId,
      is_delete: false,
    }).exec();
  }
}
