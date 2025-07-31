import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model, Types } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { TblogsService } from '../tblogs/tblogs.service';
import { formatDateDMY } from '../common/utils/date-utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService,
    private readonly tblogsService: TblogsService
      
  ) {}
  
  async create(createUserDto: CreateUserDto, ipAddress: string, performedBy: string) {
    console.log("Backend received:", createUserDto); // 🔍 Incoming request data

    // 1. Generate a random 10-character password
    const rawPassword = crypto.randomBytes(5).toString('hex');

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 3. Build the user object
    const userObj = {
      ...createUserDto,
      password: hashedPassword,
      plainPassword: rawPassword, // ✅ Save raw password (only for dev)
    };

    console.log("Saving user:", userObj); // 🔍 Verify password is present

    // 4. Save to DB
    const newUser = new this.userModel(userObj);
    const savedUser = await newUser.save();
    console.log("Saved user ID:", savedUser._id);
  
    await this.mailerService.sendMail({
      to: createUserDto.email,
      subject: 'Welcome to ProTeam Solution',
      html: `
        <p>Hello ${createUserDto.name},</p>
        <p>You have been successfully registered in the ProTeam portal.</p>
        <p><strong>Your temporary password is:</strong> ${rawPassword}</p>
        <p>Please change your password upon first login.</p>
        <p>Best regards,<br>ProTeam IT Team</p>
      `
    });

    // Log the creation
    await this.tblogsService.logAction({
      module: 'users',
      module_id: savedUser._id.toString(),
      action: 'create',
      ipAddress,
      performedBy,  // ✅ Pass authenticated user's email or ID
      remarks: `User ${savedUser.email} registered`,
      rawData: savedUser.toObject(),
    });

  // 5. Return response
  console.log("Generated raw password:", rawPassword); // <--- print it
    return {
      message: 'User created successfully',
      rawPassword, // <--- return it to frontend
      user: savedUser,
    };
  }

  async dataTable(query: any) {
    const {
      start = '0',
      length = '10',
      ['search[value]']: search = '',
      ['order[0][column]']: sortColumnIndex = '0',
      ['order[0][dir]']: sortDirection = 'asc',
    } = query;

    const skip = parseInt(start);
    const limit = parseInt(length);

    const columnMap = [
      'name',
      'email',
      'mobile',
      'divisionInfo.divisionName',
      'roleInfo.role_name',
      'profileImage'
    ];

    const sortColumn = columnMap[parseInt(sortColumnIndex)] || 'name';
    const sortOrder: any = {};
    sortOrder[sortColumn] = sortDirection === 'desc' ? -1 : 1;

    const match: any = {is_delete: false, user_type:'TEAM'};

    if (search) {
      match.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    const aggregatePipeline = [
      {
        $addFields: {
          divisionObjectId: {
            $convert: {
              input: '$division',
              to: 'objectId',
              onError: null,
              onNull: null
            }
          },
          roleObjectId: {
            $convert: {
              input: '$role',
              to: 'objectId',
              onError: null,
              onNull: null
            }
          }
        }
      },
      { $match: match },
      {
        $lookup: {
          from: 'divisions',
          localField: 'divisionObjectId',
          foreignField: '_id',
          as: 'divisionInfo'
        }
      },
      { $unwind: { path: '$divisionInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'roles',
          localField: 'roleObjectId',
          foreignField: '_id',
          as: 'roleInfo'
        }
      },
      { $unwind: { path: '$roleInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: 1,
          email: 1,
          mobile: 1,
          profileImage: 1,
          create_date:1,
          division: {
            $concat: ['$divisionInfo.divisionCode', ' - ', '$divisionInfo.divisionName']
          },
          role_name: '$roleInfo.role_name',
          is_active :1
        }
      },
      { $sort: sortOrder },
      { $skip: skip },
      { $limit: limit }
    ];

    const users = await this.userModel.aggregate(aggregatePipeline);

    const totalRecords = await this.userModel.estimatedDocumentCount();
    const filteredRecords = await this.userModel.countDocuments(match);
    
    const dataArr = users.map(user => ({
      _id: `<input type="checkbox" class="select-row" data-id="${user._id}" />`,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      division : user.division,
      role_name : user.role_name,
      profileImage : user.profileImage,
      is_active: user.is_active
        ? `<span class="badge badge-label badge-soft-success">Active</span>`
        : `<span class="badge badge-label badge-soft-warning">In-active</span>`,
      create_date: user.create_date
        ? formatDateDMY(user.create_date)
        : '',
      action : `
          <button class="btn btn-sm btn-icon btn-sm rounded-circle btn-purple edit-user" data-id="${user._id}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit Role">
            <i class="ti ti-edit"></i> 
          </button>
          <button class="btn btn-sm btn-icon btn-sm rounded-circle ${user.is_active ? 'btn-success' : 'btn-warning'} toggle-user" data-id="${user._id}" data-status="${user.is_active}" 
          data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Click To In-active">
            ${user.is_active ? '<i class="ti ti-check"></i>' : '<i class="ti ti-cancel fs-lg"></i>'}
          </button>
          <button class="btn btn-sm btn-icon btn-sm rounded-circle btn-danger delete-user" data-id="${user._id}"
          data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Click To Delete"><i class="ti ti-trash"></i></button>
        `}));

    return {
      data:dataArr,
      recordsTotal: totalRecords,
      recordsFiltered: filteredRecords
    };
  }

  async findAll() {
    return this.userModel.find({ is_delete: false,is_active:true,user_type:"TEAM",division:'686b59a942653fcea0802aaf' }).sort({ projectId: 1 });
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid User ID format');
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, ipAddress: string, performedBy: string) {
    const oldUser = await this.userModel.findById(id).exec();
    if (!oldUser) throw new NotFoundException('User not found');

    const updated = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();

    await this.tblogsService.logAction({
      module: 'users',
      module_id: id,
      action: 'update',
      ipAddress,
      performedBy,
      remarks: `User ${oldUser.email} updated`,
      rawData: {
        before: oldUser.toObject(),
        after: updated!.toObject(),
      },
    });

    return updated;
  }

  async remove(id: string, ipAddress: string, performedBy: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`User with ID ${id} not found or already deleted`);
    }

    const user = await this.userModel.findOne({
      _id: new Types.ObjectId(id),
      is_delete: false,      
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found or already deleted.`);
    }

    
    await this.tblogsService.logAction({
      module: 'users',
      module_id: id,
      action: 'delete',
      ipAddress,
      performedBy,
      remarks: `User ${user.email} deleted`,
      rawData: user.toObject(),
    });

    user.is_delete = true;
    user.last_update = new Date();
    return user.save();
  }

  async toggleStatus(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();

    if (!user) return null;

    user.is_active = !user.is_active;
    user.last_update = new Date();
    await user.save();

    return user.toObject();
  }
}
