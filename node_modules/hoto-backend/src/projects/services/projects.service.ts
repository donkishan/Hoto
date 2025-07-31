import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { Model, Types } from 'mongoose';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { TblogsService } from '../../tblogs/tblogs.service';
import { ConflictException } from '@nestjs/common';


@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private projectModel: Model<ProjectDocument>,
    private readonly tblogsService: TblogsService
  ) {}

  async create(data: CreateProjectDto, ipAddress: string, performedBy: string): Promise<ProjectDocument> {
    const exists = await this.projectModel.findOne({ projectId: data.projectId });
    if (exists) {
      throw new ConflictException(`Project ID "${data.projectId}" already exists.`);
    }
    const newProject = new this.projectModel(data);
    const saved = await newProject.save();

    await this.tblogsService.logAction({
      module: 'projects',
      module_id: saved._id.toString(),
      action: 'create',
      ipAddress,
      performedBy,
      remarks: `Project ${saved.projectName} created`,
      rawData: saved.toObject(),
    });

    return saved;
  }

  async dataTable(query: any) {
    const {
      start = '0',
      length = '10',
      ['search[value]']: search = '',
      ['order[0][column]']: sortColumnIndex = '0',
      ['order[0][dir]']: sortDirection = 'desc',
    } = query;

    const skip = parseInt(start);
    const limit = parseInt(length);

    const columnMap = [
      'projectId',
      'projectName',
      'plantPower',
      'spvName',
      'region',
      'timezone',
      'commissioning',
      'countryInfo.countryName',  // 🟢 for sorting by country
      'status',
    ];
    const sortColumn = columnMap[parseInt(sortColumnIndex)] || 'createdAt';
    const sortOrder: any = { [sortColumn]: sortDirection === 'desc' ? -1 : 1 };

    const matchStage = search
      ? {
          $or: [
            { projectId: { $regex: search, $options: 'i' } },
            { projectName: { $regex: search, $options: 'i' } },
            { spvName: { $regex: search, $options: 'i' } },
            { spvName: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const aggregatePipeline = [
      {
        $addFields: {
          countryObjectId: {
            $convert: {
              input: '$country',
              to: 'objectId',
              onError: null,
              onNull: null
            }
          }
        }
      },
      { $match: matchStage },
      {
        $lookup: {
          from: 'countries',
          localField: 'countryObjectId',         // project.country = 'AF'
          foreignField: '_id',   // countries.countryCode = 'AF'
          as: 'countryInfo',
        },
      },
      {
        $unwind: {
          path: '$countryInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: sortOrder,
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          projectId: 1,
          projectName: 1,
          spvName: 1,
          plantPower: 1,
          status: 1,
          region : 1,
          timezone : 1,
          commissioning: 1,
          is_active: 1,
          countryName: '$countryInfo.countryName',
        },
      },
    ];

    const [projects, recordsFiltered, recordsTotal] = await Promise.all([
      this.projectModel.aggregate(aggregatePipeline).exec(),
      this.projectModel.countDocuments(matchStage),
      this.projectModel.estimatedDocumentCount(),
    ]);

    const dataArr = projects.map((item) => ({
      _id: item._id,
      projectId: item.projectId,
      projectName: item.projectName,
      spvName: item.spvName,
      plantPower: item.plantPower || '-',
      region: item.region || '-',
      location: item.countryName || '-',
      timezone: item.timezone  || '-',
      commissioning: item.commissioning  || '-',
      status: (item.status=='draft')
        ? `<span class="badge badge-label badge-soft-info">Draft</span>`
        : `<span class="badge badge-label badge-soft-success">Submitted</span>`,
      is_active: item.is_active
        ? `<span class="badge badge-label badge-soft-success">Active</span>`
        : `<span class="badge badge-label badge-soft-warning">In-active</span>`,
      create_date: item.create_date
        ? new Date(item.create_date).toLocaleDateString()
        : '',
      action :item.status=='draft' ? `
          <button class="btn btn-sm btn-icon btn-sm rounded-circle btn-light view-project" data-id="${item._id}"
          data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="View"><i class="ti ti-eye"></i></button>
          <button class="btn btn-sm btn-icon btn-sm rounded-circle btn-purple edit-project" data-id="${item._id}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit Role">
            <i class="ti ti-edit"></i> 
          </button>
          <button class="btn btn-sm btn-icon btn-sm rounded-circle ${item.is_active ? 'btn-success' : 'btn-warning'} toggle-user" data-id="${item._id}" data-status="${item.is_active}" 
          data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Click To In-active">
            ${item.is_active ? '<i class="ti ti-check"></i>' : '<i class="ti ti-cancel fs-lg"></i>'}
          </button>
          <button class="btn btn-sm btn-icon btn-sm rounded-circle btn-danger delete-project" data-id="${item._id}"
          data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Click To Delete"><i class="ti ti-trash"></i></button>
          `:`<button class="btn btn-sm btn-icon btn-sm rounded-circle btn-light view-project" data-id="${item._id}"
          data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="View"><i class="ti ti-eye"></i></button>`
    }));

    return {
      data: dataArr,
      recordsTotal,
      recordsFiltered,
    };
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel.findById(new Types.ObjectId(id));
    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }
    return project;
  }

  async update(id: string, updateDto: UpdateProjectDto, ipAddress: string, performedBy: string): Promise<ProjectDocument> {
    const oldProject = await this.projectModel.findById(id).exec();
    if (!oldProject) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    const updatedProject = await this.projectModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();

    await this.tblogsService.logAction({
      module: 'projects',
      module_id: id,
      action: 'update',
      ipAddress,
      performedBy,
      remarks: `Project ${oldProject.projectName} updated`,
      rawData: {
        before: oldProject.toObject(),
        after: updatedProject!.toObject(),
      },
    });

    return updatedProject!;
  }

  async remove(id: string, ipAddress: string, performedBy: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`User with ID ${id} not found or already deleted`);
    }

    const project = await this.projectModel.findOne({
      _id: new Types.ObjectId(id),
      is_delete: false,      
    });

    if (!project) {
      throw new NotFoundException(`User with ID ${id} not found or already deleted.`);
    }

    await this.tblogsService.logAction({
      module: 'projects',
      module_id: id,
      action: 'delete',
      ipAddress,
      performedBy,
      remarks: `Project ${project.projectName} deleted`,
      rawData: project.toObject(),
    });

    project.is_delete = true;
    project.last_update = new Date();
    await project.save(); // ✅ Save the document

    return { message: 'Project deleted successfully' }; // ✅ Correct return
  }

  
  async toggleStatus(id: string): Promise<Project | null> {
    const project = await this.projectModel.findById(id).exec();

    if (!project) return null;

    project.is_active = !project.is_active;
    project.last_update = new Date();
    await project.save();

    return project.toObject();
  }

  async findAll() {
    return this.projectModel.find({ is_delete: false,is_active:true, status: 'submitted' }).sort({ projectId: 1 });
  }
  
}
