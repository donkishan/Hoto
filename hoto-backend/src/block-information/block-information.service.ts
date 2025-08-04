import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBlockInformationDto } from './dto/create-block-information.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { AssignUsersDto } from './dto/assign-users.dto';
// import { User } from '../users/schemas/user.schema';
import { BlockMember } from './schemas/block-member.schema';
import { User } from '../users/schemas/user.schema';
import { Block, BlockDocument } from '../hoto-requests/schemas/block.schema';
import { MailerService } from '@nestjs-modules/mailer';

interface FilterItem {
  division?: string;
  is_active?: boolean;
  is_delete?: boolean;
  user_type?: string;
  _id?: any; // You can be more specific if needed
  [key: string]: any; // Optional: allow other keys
}

@Injectable()
export class BlockInformationService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(BlockMember.name) private blockMemberModel: Model<BlockMember>,
    @InjectModel(Block.name) private blockModel : Model<BlockDocument>,
    private readonly mailerService: MailerService,
  ) {}

  async addMemberToUserCollection(data: any) {
    try {
      const collection = this.connection.collection('users');

      const existingUser = await collection.findOne({ email: data.email });
      console.log(existingUser);
      if (existingUser) {
        return { message: 'Email already exists.', success: false };
      }
      
      const userDoc = {
        name: data.first_name || '',
        email: data.email,
        mobile :"",
        division:data.division,
        password:"",
        plainPassword:"",
        profileImage: "",
        is_active: true, 
        is_delete: false,
        role_name: data.role_name,
        user_type: "USER",
        deployed_date: data.deployed_date,
        create_date: new Date(),        
      };

      const result = await collection.insertOne(userDoc);
      return { message: 'User added successfully', id: result.insertedId, success : true };

    } catch (error) {
      throw new Error('Failed to add user: ' + error.message);
    }
  }

  async findUsersByRoleOrType() {
    const collection = this.connection.collection('users');
    const roleId = '6867b45075a787d733131ef5';

    const users = await collection.find({
      $or: [
        { mst_roles_id: roleId },
        { mst_roles_id: new Types.ObjectId(roleId) }, 
        { role_name: { $regex: /^users$/i } }
      ],
      is_active: true,
      is_delete: false
    }).toArray();

    return users;
  }

  async findUsersForDataTable(query: any) {
    const usersCollection = this.connection.collection('users');
    const assignmentsCollection = this.connection.collection('block_members');
    const blocksCollection = this.connection.collection('blocks');

    let div: string = '';
    
    let filterArray: FilterItem[] = [];


    const {
      start = '0',
      length = '10',
      ['search[value]']: search = '',
      blockId,
      divisionId,
      status = 'NOT_ASSIGNED',
      fromDivision = ''
    } = query;

    if(blockId!=''){
      const skip = parseInt(start);
      const limit = parseInt(length);

      const baseFilter: any = {
        is_active: true,
        is_delete: false,
        user_type: 'USER'
      };

      const searchFilter = search
        ? {
            $or: [
              { first_name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
            ]
          }
        : {};

      const block = await blocksCollection.findOne(
        { _id: new Types.ObjectId(blockId) },
        { projection: { teamAckStatus: 1 } }
      );

      const isAcknowledged = block?.teamAckStatus?.trim();

      if (fromDivision!='') {
        if(fromDivision==="quality_team"){
          filterArray.push({ division: "686b59aa42653fcea0802ab1" });
          div = "686b59aa42653fcea0802ab1";
        }else{
          filterArray.push({ division: "686b59aa42653fcea0802ab0" });
          div = "686b59aa42653fcea0802ab0";
        }
        
      }else{
        if (divisionId) {
          filterArray.push({ division: divisionId });
          div = divisionId;
        }
      }
      
      // Fetch assigned user IDs
      const assignedUsers = await assignmentsCollection.find(
        {
          block_id: new Types.ObjectId(blockId),
          division: new Types.ObjectId(div),
          is_active : true,
          is_delete : false
        },
        { projection: { assigned_user: 1 } }
      ).toArray();

      const assignedUserIds = assignedUsers.map(u => new Types.ObjectId(u.assigned_user));

      let idFilter = {};

      if (status === 'NOT_ASSIGNED') {
        idFilter = { _id: { $nin: assignedUserIds } };
      } else if (status === 'ASSIGNED') {
        idFilter = { _id: { $in: assignedUserIds } };
      }
      
      filterArray = [baseFilter, searchFilter, idFilter];

      const finalFilter = {
        $and: filterArray
      };

      // console.log('divisionId:', divisionId);
      console.log('finalFilter:', JSON.stringify(finalFilter, null, 2));

      const users = await usersCollection.find(finalFilter).skip(skip).limit(limit).toArray();

      const recordsTotal = await usersCollection.countDocuments(baseFilter);
      const recordsFiltered = await usersCollection.countDocuments(finalFilter);

      const data = users.map(user => ({
        
        checkbox: (status === 'NOT_ASSIGNED')? `<input type='checkbox' class="rowCheck" name='checked_id[]' value='${user._id}'>`: `<input type='checkbox' class="rowCheck" name='checked_id1[]' value='${user._id}'>`,
        name: `${user.name}`.trim(),
        role_name: user.role_name || '',
        deployed_date: user.deployed_date || '',
        email: user.email || '',
        actions: (status === 'NOT_ASSIGNED')
        ? `
          <button class="btn btn-sm btn-icon rounded-circle btn-success assign-member" onclick="bulkAssignFromJQuery('${user._id}')" data-bs-toggle="tooltip" title="Assign">
            <i class="ti ti-plus"></i>
          </button>
          <button class="btn btn-sm btn-icon rounded-circle btn-purple edit-member" data-id="${user._id}" 
            data-user='${JSON.stringify(user).replace(/'/g, "&#39;")}' data-bs-toggle="tooltip" title="Edit">
            <i class="ti ti-edit"></i> 
          </button>
          <button class="btn btn-sm btn-icon rounded-circle btn-danger delete-member" data-id="${user._id}" data-bs-toggle="tooltip" title="Delete">
            <i class="ti ti-trash"></i>
          </button>
        `
        : ((isAcknowledged=='PENDING')
            ?  `
              <button class="btn btn-sm btn-icon rounded-circle btn-danger remove-member" data-id="${user._id}" data-bs-toggle="tooltip" title="Delete">
                <i class="ti ti-trash"></i>
              </button>
            ` 
            :'')
        
      }));

      return {
        data,
        recordsTotal,
        recordsFiltered
      };
    }else{
      return {
        data: [],
        recordsTotal: 0,
        recordsFiltered: 0
      };
    }   
  }

  async addMemberToBlock(dto: AssignUsersDto){
    const { projectId, hotoRequestId, block_id, division, userId, users_id } = dto;
    if (
      !Types.ObjectId.isValid(block_id) ||
      !Types.ObjectId.isValid(division) ||
      !Types.ObjectId.isValid(userId) ||
      users_id.some((id) => !Types.ObjectId.isValid(id))
    ) {
      throw new BadRequestException('Invalid MongoDB ObjectIds');
    }

    const collection = this.connection.collection('block_members');

    const documents = users_id.map((uid) => ({
      block_id      : new Types.ObjectId(block_id),
      division      : new Types.ObjectId(division),
      assigned_by   : new Types.ObjectId(userId),
      assigned_user : new Types.ObjectId(uid),
      create_date   : new Date(),
      hotoRequestId : new Types.ObjectId(hotoRequestId),
      projectId     : new Types.ObjectId(projectId),
      last_update   : '',
      is_active     : true,
      is_delete     : false,
    }));

    const result = await collection.insertMany(documents);

    return {
      success: true,
      message: `${result.insertedCount} users assigned to block.`,
      inserted_ids: result.insertedIds
    };
  }

  async deleteMember(dto: AssignUsersDto): Promise<{ success: boolean; message?: string }> {
    const { block_id, users_id } = dto;

    try {
      const objectUserIds = users_id.map(id => new Types.ObjectId(id));

      const userUpdateResult = await this.userModel.updateMany(
        {
          _id: { $in: objectUserIds },
          is_active: true,
          is_delete: false
        },
        {
          $set: { is_active: false, is_delete: true, last_update:new Date()}
        }
      );

      const blockUpdateResult = await this.blockMemberModel.updateMany(
        {
          // block_id: new Types.ObjectId(block_id),
          assigned_user: { $in: objectUserIds },
          is_active: true,
          is_delete: false
        },
        {
          $set: { is_active: false, is_delete: true, last_update:new Date() }
        }
      );

      return { success: true,message:'Team members deleted' };
    } catch (error) {
      console.error('Remove member error:', error);
      return { success: false, message: 'An error occurred while removing members' };
    }
  }

  async removeMember(dto: AssignUsersDto): Promise<{ success: boolean; message?: string }> {
    const { block_id, users_id } = dto;

    try {
      const objectUserIds = users_id.map(id => new Types.ObjectId(id));

      const blockUpdateResult = await this.blockMemberModel.updateMany(
        {
          block_id: new Types.ObjectId(block_id),
          assigned_user: { $in: objectUserIds },
          is_active: true,
          is_delete: false
        },
        {
          $set: { is_active: false, is_delete: true, last_update:new Date() }
        }
      );

      return { success: true,message:'Team members removed.' };
    } catch (error) {
      console.error('Remove member error:', error);
      return { success: false, message: 'An error occurred while removing members' };
    }
  }

  create(createBlockInformationDto: CreateBlockInformationDto) {
    return 'This action adds a new blockInformation';
  }

  async updateMember(id: string, updateDto: any) {
    const collection = this.connection.collection('users');
    const objectId = new Types.ObjectId(id);

    const existingUser = await collection.findOne({
      email: updateDto.email,
      _id: { $ne: objectId }
    });

    if (existingUser) {
      return {
        success: false,
        message: 'Email already in use by another user.'
      };
    }

    const userDoc = {
      name: updateDto.first_name || '',
      email: updateDto.email,
      deployed_date: updateDto.deployed_date,      
      is_active: true,
      is_delete: false,
      role_name: updateDto.role_name, 
      last_update: new Date()
    };

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: userDoc }
    );

    if (result.modifiedCount > 0) {
      return { success: true, message: 'Member updated successfully' };
    } else {
      return { success: false, message: 'No changes made or member not found' };
    }
  }

  async remove(id: string) {
    const collection = this.connection.collection('users');
    const objectId = new Types.ObjectId(id);

    const result = await collection.updateOne(
      { _id: objectId },
      {
        $set: {
          is_delete: true,
          is_active: false
        }
      }
    );

    if (result.modifiedCount > 0) {
      return { success: true, message: 'User soft-deleted successfully' };
    } else {
      throw new Error('User not found or already deleted');
    }
  }

  async requestAcknowledgement(blockId: string,userId: string,divisionId: string): Promise<BlockDocument | null> {
    const objectId = new Types.ObjectId(blockId);
    const block = await this.blockModel.findById(objectId);

    if (!block) return null;

    const projectName = 'Bhadla-4 Ph-1';
    const projectCode = 'Bhadla-4 Ph-1';
    if(divisionId==='686b59aa42653fcea0802ab0'){
      //asset team
      block.assetTeamAckStatus = 'requested'; 
      block.assetTeamAckRaisedDate = new Date();
      block.assetTeamAckRaisedBy = new Types.ObjectId(userId);
      

     
      await this.mailerService.sendMail({
        to: 'raghu.darshan@proteam.co.in',
        cc:'jitendra@proteam.co.in,snehal.v@proteam.co.in',
        subject: 'Asset team requestd for team acknowledegement',
        html: `
          <p>Dear Team,</p>
          <p>Asset team request for team acknowelegement for the project: <strong>${projectName}</strong></p>
          <p><strong>Project Code:</strong> ${projectCode}</p>
          <p>Please log in to the portal for more details.</p>
          <br />
          <br/>
          This is system generated mail. Please do not replay.
          <BR>
          Thanks & Tegards,
          <BR/>
          Hoto Team
        `
      });

      return await block.save();
    }else{
      //quality team
      block.qualityTeamAckStatus = 'requested'; 
      block.qualityTeamAckRaisedDate = new Date();
      block.qualityTeamAckRaisedBy = new Types.ObjectId(userId);

       await this.mailerService.sendMail({
        to: 'raghu.darshan@proteam.co.in',
        cc:'jitendra@proteam.co.in,snehal.v@proteam.co.in',
        subject: 'Quality team requestd for team acknowledegement',
        html: `
          <p>Dear Team,</p>
          <p>Quality team request for team acknowelegement for the project: <strong>${projectName}</strong></p>
          <p><strong>Project Code:</strong> ${projectCode}</p>
          <p>Please log in to the portal for more details.</p>
          <br />
          <br/>
          This is system generated mail. Please do not replay.
          <BR/>
          Thanks & Tegards,
          <BR/>
          Hoto Team
        `
      });
      return await block.save();
    }
  }

  async acknowledge(blockId: string,userId: string,divisionId: string): Promise<BlockDocument | null> {
    const objectId = new Types.ObjectId(blockId);
    const block = await this.blockModel.findById(objectId);

    if (!block) return null;

     const projectName = 'Bhadla-4 Ph-1';
    const projectCode = 'Bhadla-4 Ph-1';

    if(divisionId==='686b59aa42653fcea0802ab0'){
      //asset team
      block.assetTeamAckStatus = 'acknowledged'; 
      block.assetTeamAckDate = new Date();
      block.assetTeamAckBy = new Types.ObjectId(userId);

      await this.mailerService.sendMail({
        to: 'raghu.darshan@proteam.co.in',
        cc:'jitendra@proteam.co.in,snehal.v@proteam.co.in',
        subject: 'Project Team acknoweledge the team.',
        html: `
          <p>Dear Team,</p>
          <p>Project team has acknoweledge the team for the project: <strong>${projectName}</strong></p>
          <p><strong>Project Code:</strong> ${projectCode}</p>
          <p>Please log in to the portal for more details.</p>
          <br />
          <br/>
          This is system generated mail. Please do not replay.
          <BR>
          Thanks & Tegards,
          <BR/>
          Hoto Team
        `
      });

      return await block.save();


    }else{
      //quality team
      block.qualityTeamAckStatus = 'acknowledged'; 
      block.qualityTeamAckDate = new Date();
      block.qualityTeamAckBy = new Types.ObjectId(userId);

      await this.mailerService.sendMail({
        to: 'raghu.darshan@proteam.co.in',
        cc:'jitendra@proteam.co.in,snehal.v@proteam.co.in',
        subject: 'Project Team acknoweledge the team.',
        html: `
          <p>Dear Team,</p>
          <p>Project team has acknoweledge the team for the project: <strong>${projectName}</strong></p>
          <p><strong>Project Code:</strong> ${projectCode}</p>
          <p>Please log in to the portal for more details.</p>
          <br />
          <br/>
          This is system generated mail. Please do not replay.
          <BR>
          Thanks & Tegards,
          <BR/>
          Hoto Team
        `
      });
      return await block.save();
    }
  }

  async upadtePunchPointStatus(blockId: string,userId: string,divisionId: string): Promise<BlockDocument | null> {
    const objectId = new Types.ObjectId(blockId);
    const block = await this.blockModel.findById(objectId);

    if (!block) return null;

     const projectName = 'Bhadla-4 Ph-1';
    const projectCode = 'Bhadla-4 Ph-1';

    if(divisionId==='686b59aa42653fcea0802ab0'){
      //asset team
      block.assetTeamPunchPointStatus = 'requested'; 
      block.assetTeamPunchPointRaisedDate = new Date();
      block.assetTeamPunchPointBy = new Types.ObjectId(userId);
     

      await this.mailerService.sendMail({
        to: 'raghu.darshan@proteam.co.in',
        cc:'jitendra@proteam.co.in,snehal.v@proteam.co.in',
        subject: 'Asset team requestd for punchpoint acknowledegement',
        html: `
          <p>Dear Team,</p>
          <p>Asset team request for punchpoint acknowelegement for the project: <strong>${projectName}</strong></p>
          <p><strong>Project Code:</strong> ${projectCode}</p>
          <p>Please log in to the portal for more details.</p>
          <br />
          <br/>
          This is system generated mail. Please do not replay.
          <BR/>
          Thanks & Tegards,
          <BR/>
          Hoto Team
        `
      });

       return await block.save();

    }else if(divisionId==='686b59aa42653fcea0802ab1'){
      //quality team
      block.qualityTeamPunchPointStatus = 'requested'; 
      block.qualityTeamPunchPointRaisedDate = new Date();
      block.qualityTeamPunchPointBy = new Types.ObjectId(userId);

        await this.mailerService.sendMail({
        to: 'raghu.darshan@proteam.co.in',
        cc:'jitendra@proteam.co.in,snehal.v@proteam.co.in',
        subject: 'Quality team requestd for punchpoint acknowledegement',
        html: `
          <p>Dear Team,</p>
          <p>Quality team request for punchpoint acknowelegement for the project: <strong>${projectName}</strong></p>
          <p><strong>Project Code:</strong> ${projectCode}</p>
          <p>Please log in to the portal for more details.</p>
          <br />
          <br/>
          This is system generated mail. Please do not replay.
         <BR/>
          Thanks & Tegards,
          <BR/>
          Hoto Team
        `
      });

      return await block.save();
    }else if(divisionId=='686b59a942653fcea0802aaf'){
      //project team
      block.assetTeamPunchPointAckBy = new Types.ObjectId(userId);
      block.assetTeamPunchPointAckDate = new Date();
      block.assetTeamPunchPointStatus = 'acknowledged';

      block.qualityTeamPunchPointAckBy = new Types.ObjectId(userId);
      block.qualityTeamPunchPointAckDate = new Date();
      block.qualityTeamPunchPointStatus = 'acknowledged';

       await this.mailerService.sendMail({
        to: 'raghu.darshan@proteam.co.in',
        cc:'jitendra@proteam.co.in,snehal.v@proteam.co.in',
        subject: 'Project team has acknowledge the punchpoints',
        html: `
          <p>Dear Team,</p>
          <p>Project team has acknowledge the punchpoints for the project: <strong>${projectName}</strong></p>
          <p><strong>Project Code:</strong> ${projectCode}</p>
          <p>Please log in to the portal for more details.</p>
          <br />
          <br/>
          This is system generated mail. Please do not replay.
          <BR/>
          Thanks & Tegards,
          <BR/>
          Hoto Team
        `
      });

      return await block.save();
    }

    return null;

  }

}
