import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Documentation } from './documentation.interface';
import { Project } from './project.interface';
import { Division, DivisionDocument } from '../divisions/schemas/division.schema'; // ✅ Adjust the path if needed

@Injectable()
export class DocumentationService {
  constructor(@InjectModel('Documentation') private readonly docModel: Model<Documentation>,
@InjectModel('Project') private readonly projectModel: Model<Project>,
@InjectModel(Division.name) private readonly divisionModel: Model<DivisionDocument>
 
) {}

  async create(payload: any) {
  // Fill divisionName dynamically
  for (const doc of payload.documents) {
    if (doc.division && !doc.divisionName) {
      const division = await this.divisionModel.findById(doc.division).lean().exec();
      doc.divisionName = division?.divisionName || '';
    }
  }

  return await new this.docModel(payload).save();
}

  async findAll() {
    return await this.docModel.find().exec();
  }

  // documentation.service.ts

 async findOne(id: string) {
  const doc = await this.docModel.findById(id).lean().exec();
  if (!doc) return null;

  const project = await this.projectModel.findById(doc.projectId).lean().exec();

  // Fetch all unique division IDs from documents
  const divisionIds = doc.documents
    .map((d: any) => d.division)
    .filter((id: string | undefined) => !!id);

  const divisions = await this.divisionModel.find({ _id: { $in: divisionIds } }).lean().exec();

  // Create a lookup map
  const divisionMap = new Map<string, string>();
  divisions.forEach(div => {
    divisionMap.set(String(div._id), div.divisionName);
  });

  // Assign divisionName dynamically
  doc.documents = doc.documents.map((d: any) => ({
    ...d,
    divisionName: divisionMap.get(String(d.division)) || ''
  }));

  return {
    ...doc,
    projectDetails: project
      ? {
          projectName: project.projectName,
          projectCode: project.projectId,
          plantPower: project.plantPower
        }
      : null
  };
}

  async remove(id: string) {
    return await this.docModel.findByIdAndDelete(id).exec();
  }

  async getDataTable(query: any) {
    const start = parseInt(query.start) || 0;
    const length = parseInt(query.length) || 10;
    const search = query.search?.value?.trim() || '';

    const searchQuery = search
      ? {
          $or: [
            { projectName: { $regex: search, $options: 'i' } },
            { 'documents.documentName': { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const totalRecords = await this.docModel.countDocuments();
    const filteredRecords = await this.docModel.countDocuments(searchQuery);

    const docs = await this.docModel
      .find(searchQuery)
      .skip(start)
      .limit(length)
      .lean()
      .exec();

    const data = docs.map((doc) => ({
      _id: doc._id,
      projectName: doc.projectName,
      documentsCount: doc.documents?.length || 0,
      action: `
        <button class="btn btn-sm btn-primary edit-documentation" data-id="${doc._id}">Edit
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-documentation" data-id="${doc._id}">Delete
          <i class="bi bi-trash"></i>
        </button>
      `
    }));

    return {
      draw: parseInt(query.draw) || 1,
      recordsTotal: totalRecords,
      recordsFiltered: filteredRecords,
      data
    };
  }
  async update(id: string, updateDto: any) {
  return await this.docModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
}

}
