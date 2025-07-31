
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HotoRequest, HotoRequestDocument } from './schemas/hoto-requests.schema';
import { Block, BlockDocument } from './schemas/block.schema';
import * as fs from 'fs';
import { TblogsService } from '../tblogs/tblogs.service';
import { DivisionDocument } from '../divisions/schemas/division.schema';

@Injectable()
export class HotoRequestsService {
  constructor(
    @InjectModel(HotoRequest.name)
    private readonly hotoModel: Model<HotoRequestDocument>,

    @InjectModel(Block.name)
    private readonly blockModel: Model<BlockDocument>,

    @InjectModel('Division') 
    private readonly divisionModel: Model<DivisionDocument>, 

    private readonly tblogsService: TblogsService,

  ) {}
  
  async create(data: {
    blocks: any[];
    certificatePath?: string;
    ipAddress?: string;
    performedBy?: string;
    [key: string]: any;
  }): Promise<any> {
    const { blocks, ipAddress, performedBy, ...hotoData } = data;

    const createdHoto = await this.hotoModel.create(hotoData);

    const blockDocs = blocks.map((block) => ({
      ...block,
      hotoRequestId: createdHoto._id,
    }));

    await this.blockModel.insertMany(blockDocs);

    // ✅ Log creation
    await this.tblogsService.logAction({
      module: 'hoto-requests',
      module_id: String(createdHoto._id),
      action: 'create',
      ipAddress: ipAddress || '',
      performedBy: performedBy || '',
      remarks: `Created HOTO request for project ${createdHoto.projectCode}`,
      rawData: {
        hoto: createdHoto.toObject(),
        blocks: blockDocs,
      },
    });

    return {
      message: 'HOTO request and blocks created successfully.',
      hotoRequestId: createdHoto._id,
    };
  }

  async dataTable(query: any) {
    const {
      start = '0',
      length = '10',
      ['search[value]']: search = '',
      ['order[0][column]']: sortColumnIndex = '0',
      ['order[0][dir]']: sortDirection = 'desc',
      project_type,
      project_name,
      cod_date,
      init_date,
      initiated_by,
      status,
    } = query;

    const skip = parseInt(start);
    const limit = parseInt(length);

    const columnMap = [
      'projectId',
      'projectCode',
      'capacity',
      'completionType',
      'initiatedDate',
      'initiatedById',
      'projectInfo.projectName',
      'userInfo.name',
      'status',
    ];
    const sortColumn = columnMap[parseInt(sortColumnIndex)] || 'createdAt';
    const sortOrder: any = {};
    sortOrder[sortColumn] = sortDirection === 'desc' ? -1 : 1;

    const filter: Record<string, any> = search
      ? {
          $or: [
            { projectId: { $regex: search, $options: 'i' } },
            { projectCode: { $regex: search, $options: 'i' } },
          ],
        }
      : {};
      
    if (status) filter.status = status;
    if (cod_date) filter.codDate = { $regex: cod_date, $options: 'i' };
    if (init_date) filter.initiatedDate = { $regex: init_date, $options: 'i' };
    if (project_type) filter.completionType = project_type;

    const aggregationPipeline: any[] = [
      {
        $addFields: {
          projectObjectId: {
            $convert: {
              input: '$projectId',
              to: 'objectId',
              onError: null,
              onNull: null,
            },
          },
          userObjectId: {
            $convert: {
              input: '$initiatedById',
              to: 'objectId',
              onError: null,
              onNull: null,
            },
          },
        },
      },
      { $match: filter },
      {
        $lookup: {
          from: 'projects', // ✅ Collection name
          localField: 'projectObjectId', // ✅ Use converted ObjectId
          foreignField: '_id',
          as: 'projectInfo',
        },
      },
      {
        $lookup: {
          from: 'users', // ✅ Collection name
          localField: 'userObjectId', // ✅ Use converted ObjectId
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: { path: '$projectInfo', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
      { $sort: sortOrder },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          projectId: 1,
          projectCode: 1,
          capacity: 1,
          completionType: 1,
          initiatedDate: 1,
          initiatedById: 1,
          status: 1,
          codDate:1,
          projectName: '$projectInfo.projectName', 
          name: '$userInfo.name',         
        },
      },
    ];

    const hotoRequests = await this.hotoModel.aggregate(aggregationPipeline).exec();

    const recordsTotal = await this.hotoModel.estimatedDocumentCount();
    const recordsFiltered = await this.hotoModel.countDocuments(filter);

    const dataArr = hotoRequests.map((item) => ({
      _id: item._id,
      projectId: item.projectId,
      projectCode: item.projectCode,
      projectName: item.projectName || '-',        
      capacity: item.capacity || '-',
      completionType: item.completionType || '-',
      codDate: item.codDate || '-',
      initiatedDate: item.initiatedDate || '-',
      initiatedById: item.initiatedById,
      name: item.name || '-',          
      status: (item.status=='draft') ?`<span class="badge badge-label badge-soft-info">Draft</span>`:`<span class="badge badge-label badge-soft-success">Submitted</span>`,
      action : (item.status=='draft') ?`
          <button class="btn btn-sm btn-icon btn-sm rounded-circle btn-light view-user" data-id="${item._id}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="View">
            <i class="ti ti-eye"></i>
          </button>
          <button class="btn btn-sm btn-icon btn-sm rounded-circle btn-purple edit-user" data-id="${item._id}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit Role">
            <i class="ti ti-edit"></i> 
          </button>
          <button class="btn btn-sm btn-icon btn-sm rounded-circle ${item.is_active ? 'btn-success' : 'btn-warning'} toggle-user" data-id="${item._id}" data-status="${item.is_active}" 
          data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Click To In-active">
            ${item.is_active ? '<i class="ti ti-check"></i>' : '<i class="ti ti-cancel fs-lg"></i>'}
          </button>
          <button class="btn btn-sm btn-icon btn-sm rounded-circle btn-danger delete-user" data-id="${item._id}"
          data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Click To Delete"><i class="ti ti-trash"></i></button>
        `:`<button class="btn btn-sm btn-icon btn-sm rounded-circle btn-light view-user" data-id="${item._id}"
          data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="View"><i class="ti ti-eye"></i></button>`
    }));

    return {
      data: dataArr,
      recordsTotal,
      recordsFiltered,
    };
  }

  async findOne(id: string, blockId: string): Promise<any> {
    const objectId = new Types.ObjectId(id);

    const result = await this.hotoModel.aggregate([
      {
        $addFields: {
          projectObjectId: {
            $convert: {
              input: '$projectId',
              to: 'objectId',
              onError: null,
              onNull: null,
            },
          },
          userObjectId: {
            $convert: {
              input: '$initiatedById',
              to: 'objectId',
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $match: { _id: objectId }
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectObjectId',
          foreignField: '_id',
          as: 'projectInfo',
        },
      },
      {
        $lookup: {
          from: 'users', 
          localField: 'userObjectId', 
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: { path: '$projectInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 1,
          projectId: 1,
          projectCode: 1,
          capacity: 1,
          completionType: 1,
          initiatedDate: 1,
          initiatedById: 1,
          status: 1,
          codDate:1,
          acknowledgeStatus:1,
          acknowledgedBy:1,
          acknowledgedOn:1,
          hotoFor:1,
          hotoCapacity:1,
          certificatePath:1,
          projectName: '$projectInfo.projectName', 
          name: '$userInfo.name',         
        }
      }
    ]);
    
    const hoto = result[0];
    if (!hoto) throw new NotFoundException(`HOTO request with ID ${id} not found`);
    
    const matchStage: any = {
      hotoRequestId: new Types.ObjectId(id)
    };

    if (blockId) {
      matchStage._id = new Types.ObjectId(blockId);
    }
    
    const blocks = await this.blockModel.aggregate([
      {
        $match: matchStage
      },
      {
        $addFields: {
          stringBlockId: { $toString: '$_id' }
        }
      },
      {
        $lookup: {
          from: 'block_members',
          localField: '_id',
          foreignField: 'block_id',
          as: 'members'
        }
      },
      {
        $addFields: {
          memberCount: {
            $size: {
              $filter: {
                input: '$members',
                as: 'member',
                cond: {
                  $and: [
                    { $eq: ['$$member.is_active', true] },
                    { $eq: ['$$member.is_delete', false] }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'site_readiness_activity',
          pipeline: [
            {
              $addFields: {
                stringActivityId: { $toString: '$_id' }
              }
            },
            {
              $lookup: {
                from: 'site_readiness_status',
                let: { activityId: '$stringActivityId' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$site_readiness_activity_id', '$$activityId'] },
                          { $eq: ['$block_id', '$$blockId'] },
                          { $eq: ['$is_deleted', false] }
                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      _id: 0,
                      status: 1,
                      updated_at: 1
                    }
                  }
                ],
                as: 'status_info'
              }
            },
            {
              $addFields: {
                status: { $ifNull: [{ $arrayElemAt: ['$status_info.status', 0] }, '' ] },
                updated_at: { $ifNull: [{ $arrayElemAt: ['$status_info.updated_at', 0] }, null ] }
              }
            },
            {
              $project: {
                status_info: 0,
                stringActivityId: 0
              }
            }
          ],
          as: 'site_readiness_activities',
          let: { blockId: '$stringBlockId' }
        }
      },
      {
        $lookup: {
          from: 'punchpoints',
          let: { blockId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$blockId', '$$blockId'] },
                    { $eq: ['$is_delete', false] }
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                critical_count: {
                  $sum: {
                    $cond: [{ $eq: ['$category', 'CRITICAL'] }, 1, 0]
                  }
                },
                non_critical_count: {
                  $sum: {
                    $cond: [{ $eq: ['$category', 'NON_CRITICAL'] }, 1, 0]
                  }
                },
                total_punchpoints: { $sum: 1 },
                pending_count: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0]
                  }
                },
                in_progress_count: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0]
                  }
                },
                completed_count: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0]
                  }
                }
              }
            }
          ],
          as: 'punch_point_stats'
        }
      },
      {
        $addFields: {
          punch_point_stats: {
            $ifNull: [
              { $arrayElemAt: ['$punch_point_stats', 0] },
              {
                critical_count: 0,
                non_critical_count: 0,
                total_punchpoints: 0,
                pending_count: 0,
                in_progress_count: 0,
                completed_count: 0
              }
            ]
          }
        }
      },
      {
        $project: {
          members: 0,
          stringBlockId: 0
        }
      }
    ]);

    return { ...hoto, blocks };
  }

  async update(id: string, data: any): Promise<any> {
    const { blocks = [], ipAddress, performedBy, ...hotoData } = data;

    const objectId = new Types.ObjectId(id);
    const oldHoto = await this.hotoModel.findById(objectId).lean();
    if (!oldHoto) throw new NotFoundException(`HOTO request with ID ${id} not found`);

    console.log(hotoData);
    const updatedHoto = await this.hotoModel.findByIdAndUpdate(objectId, hotoData, {
      new: true,
      runValidators: true,
    });

    const incomingBlockIds = blocks
      .filter((b) => b._id)
      .map((b) => new Types.ObjectId(b._id));

    await this.blockModel.deleteMany({
      hotoRequestId: objectId,
      _id: { $nin: incomingBlockIds },
    });

    const updatedBlocks: Partial<BlockDocument>[] = [];

    for (const block of blocks) {
      const { _id, createdAt, updatedAt, __v, ...sanitized } = block;
      sanitized.hotoRequestId = objectId;
      if (_id) {
        const updated = await this.blockModel.findByIdAndUpdate(
          _id,
          sanitized,
          { new: true, runValidators: true }
        );
        if (updated) updatedBlocks.push(updated.toObject());
      } else {
        const created = await this.blockModel.create(sanitized);
        updatedBlocks.push(created.toObject());
      }
    }

    await this.tblogsService.logAction({
      module: 'hoto-requests',
      module_id: id,
      action: 'update',
      ipAddress: ipAddress || '',
      performedBy: performedBy || '',
      remarks: `Updated HOTO request for project ${updatedHoto?.projectCode}`,
      rawData: {
        before: oldHoto,
        after: updatedHoto?.toObject?.() || updatedHoto,
        updatedBlocks,
      },
    });

    return {
      message: 'HOTO request updated successfully.',
      hotoRequestId: updatedHoto?._id,
    };
  }

  async remove(id: string, ipAddress = '', performedBy = ''): Promise<{ message: string }> {
    const hoto = await this.hotoModel.findById(id);
    if (!hoto) throw new NotFoundException(`Cannot delete, HOTO request with ID ${id} not found`);

    if (hoto.certificatePath && fs.existsSync(hoto.certificatePath)) {
      fs.unlinkSync(hoto.certificatePath);
    }

    await this.blockModel.deleteMany({ hotoRequestId: id });
    await this.hotoModel.findByIdAndDelete(id);

    // ✅ Log deletion
    await this.tblogsService.logAction({
      module: 'hoto-requests',
      module_id: id,
      action: 'delete',
      ipAddress,
      performedBy,
      remarks: `Deleted HOTO request for project ${hoto.projectCode}`,
      rawData: hoto.toObject(),
    });

    return { message: `HOTO request with ID ${id} deleted successfully.` };
  }
  
  async findByDivision(id: string, divisionId: string): Promise<any> {
    const objectId = new Types.ObjectId(id);
    const divisionObjectId = new Types.ObjectId(divisionId);

    const result = await this.hotoModel.aggregate([
      {
        $addFields: {
          projectObjectId: {
            $convert: {
              input: '$projectId',
              to: 'objectId',
              onError: null,
              onNull: null,
            },
          },
          userObjectId: {
            $convert: {
              input: '$initiatedById',
              to: 'objectId',
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $match: { _id: objectId }
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectObjectId',
          foreignField: '_id',
          as: 'projectInfo',
        },
      },
      {
        $lookup: {
          from: 'users', 
          localField: 'userObjectId', 
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: { path: '$projectInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 1,
          projectId: 1,
          projectCode: 1,
          capacity: 1,
          completionType: 1,
          initiatedDate: 1,
          initiatedById: 1,
          status: 1,
          codDate:1,
          acknowledgeStatus:1,
          acknowledgedBy:1,
          acknowledgedOn:1,
          hotoFor:1,
          hotoCapacity:1,
          certificatePath:1,
          projectName: '$projectInfo.projectName', 
          name: '$userInfo.name',         
        }
      }
    ]);
    
    const hoto = result[0];
    if (!hoto) throw new NotFoundException(`HOTO request with ID ${id} not found`);
    
    const matchStage: any = {
      hotoRequestId: new Types.ObjectId(id)
    };

    const blocks = await this.blockModel.aggregate([
      {
        $match: matchStage
      },
      {
        $addFields: {
          stringBlockId: { $toString: '$_id' }
        }
      },
      {
        $lookup: {
          from: 'block_members',
          localField: '_id',
          foreignField: 'block_id',
          as: 'members'
        }
      },
      {
        $addFields: {
          memberCount: {
            $size: {
              $filter: {
                input: '$members',
                as: 'member',
                cond: {
                  $and: [
                    { $eq: ['$$member.is_active', true] },
                    { $eq: ['$$member.is_delete', false] },
                    { $eq: ['$$member.division', new Types.ObjectId(divisionId)] }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'punchpoints',
          let: { blockId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$blockId', '$$blockId'] },
                    { $eq: ['$divisionId', divisionObjectId] },
                    { $eq: ['$is_delete', false] }
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                critical_count: {
                  $sum: {
                    $cond: [{ $eq: ['$category', 'CRITICAL'] }, 1, 0]
                  }
                },
                non_critical_count: {
                  $sum: {
                    $cond: [{ $eq: ['$category', 'NON_CRITICAL'] }, 1, 0]
                  }
                },
                total_punchpoints: { $sum: 1 },
                pending_count: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0]
                  }
                },
                in_progress_count: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0]
                  }
                },
                completed_count: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0]
                  }
                }
              }
            }
          ],
          as: 'punch_point_stats'
        }
      },
      {
        $addFields: {
          punch_point_stats: {
            $ifNull: [
              { $arrayElemAt: ['$punch_point_stats', 0] },
              {
                critical_count: 0,
                non_critical_count: 0,
                total_punchpoints: 0,
                pending_count: 0,
                in_progress_count: 0,
                completed_count: 0
              }
            ]
          }
        }
      },
      {
        $project: {
          members: 0,
          stringBlockId: 0
        }
      }
    ]);

    return { ...hoto, blocks };
  }
}
