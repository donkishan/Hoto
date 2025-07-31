import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePunchPointDto } from '../dto/create-punch-point.dto';
import { UpdatePunchPointDto } from '../dto/update-punch-point.dto';
import { PunchPoint } from '../schemas/punch-point.schema';
import * as ExcelJS from 'exceljs';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { isValidObjectId } from 'mongoose'; // ✅ Import this helper
import { TblogsService } from '../../tblogs/tblogs.service';
import { UploadPunchPointDto } from '../dto/upload-punch-point.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { UploadLog } from '../schemas/upload-log.schema';
import { formatDateDMY, formatDateYMD } from '../../common/utils/date-utils';
import { HotoRequest, HotoRequestDocument } from '../../hoto-requests/schemas/hoto-requests.schema';
import { Block, BlockDocument } from '../../hoto-requests/schemas/block.schema';
import { UpdateStatusDto } from '../dto/update-status.dto';
import { UploadStatusLog } from '../schemas/upload-status-log.schema';

@Injectable()
export class PunchPointService {

  constructor(
    @InjectModel(PunchPoint.name)
    private punchPointModel: Model<PunchPoint>,
    private readonly tblogsService: TblogsService,

    @InjectModel('UploadLog') 
    private uploadLogModel: Model<UploadLog>,

    @InjectModel('UploadStatusLog') 
    private uploadSatusLogModel: Model<UploadStatusLog>,

    @InjectModel(HotoRequest.name)
    private readonly hotoModel: Model<HotoRequestDocument>,

    @InjectModel(Block.name)
    private readonly blockModel: Model<BlockDocument>, 
  ) {}

  async create(createDto: CreatePunchPointDto): Promise<PunchPoint> {
    const taskData = {
      ...createDto,
      blockId: new Types.ObjectId(createDto.blockId),
      ...(createDto.divisionId && {
        divisionId: new Types.ObjectId(createDto.divisionId),
      }), 
      ...(createDto.hotoRequestId && {
        hotoRequestId: new Types.ObjectId(createDto.hotoRequestId),
      }), 
      ...(createDto.projectId && {
        projectId: new Types.ObjectId(createDto.projectId),
      }), 
      ...(createDto.userId && {
        userId: new Types.ObjectId(createDto.userId),
      }), 
    };
    return await this.punchPointModel.create(taskData);
  }

  async findAll(query: any): Promise<any> {
    const start       = parseInt(query.start) || 0;
    const length      = parseInt(query.length) || 10;
    const search      = query['search[value]'] || '';
    const draw        = parseInt(query.draw) || 1;
    const blockId     = query.blockId;
    const divisionId  = query.divisionId;

    const filter: any = {
      $and: [
        {
          $or: [
            { is_delete: false },
            { is_delete: { $exists: false } },
          ],
        },
      ],
    };
    
    if (blockId) {
      filter.blockId = new Types.ObjectId(blockId); 
    }
    
    if(divisionId=="686b59aa42653fcea0802ab0" || divisionId=="686b59aa42653fcea0802ab1"){
      filter.divisionId = new Types.ObjectId(divisionId);
    }

    if (search) {
      filter.$or = [
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
        { categoryWork: { $regex: search, $options: 'i' } },
        { team: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { remarks: { $regex: search, $options: 'i' } },
      ];
    }

    if (query.location) {
      filter.$and.push({ location: { $regex: '^' + query.location, $options: 'i' } });
    }
    if (query.area) {
      filter.$and.push({ area: { $regex: '^' + query.area, $options: 'i' } });
    }
    if (query.team) {
      filter.$and.push({ team: query.team });
    }
    if (query.category) {
      filter.$and.push({ category: query.category });
    }

    const totalRecords = await this.punchPointModel.countDocuments(filter);
    const data = await this.punchPointModel
      .find(filter)
      .sort({ _id: -1 })
      .skip(start)
      .limit(length)
      .lean();

    const responseData = data.map((row) => ({
      ...row,
      target_closure_date: formatDateDMY(row.target_closure_date),
      actual_closure_date: (row.status!='COMPLETED')?row.actual_closure_date:formatDateDMY(row.actual_closure_date),
      actions:`
      <div class="d-flex gap-1">
        <button class="btn btn-sm btn-icon btn-sm rounded-circle btn-purple edit-btn" data-id="${row._id}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit">
          <i class="ti ti-edit"></i>
        </button>
        <button class="btn btn-sm btn-icon btn-sm rounded-circle btn-danger delete-btn" data-id="${row._id}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Click To Delete">
          <i class="ti ti-trash"></i>
        </button>
      </div>`,
    }));

    return {
      draw,
      recordsTotal: totalRecords,
      recordsFiltered: totalRecords,
      data: responseData,
    };
  }

  async findOne(id: string): Promise<PunchPoint | null> {
    return this.punchPointModel.findById(id).lean();
  }

  async update(id: string, updateDto: UpdatePunchPointDto ): Promise<PunchPoint | null> {
    const updatedData: any = {
      ...updateDto,
    };
    const objectIdFields = ['blockId', 'hotoRequestId', 'projectId', 'userId', 'divisionId'];
    objectIdFields.forEach((key) => {
      const value = updateDto[key];
      if (value && Types.ObjectId.isValid(value)) {
        updatedData[key] = new Types.ObjectId(value);
      }
    });

    return this.punchPointModel.findByIdAndUpdate(id, updatedData, { new: true }).lean();
  }

  async remove(id: string): Promise<any> {
    return this.punchPointModel.findByIdAndUpdate(
      id,
      { is_delete: true, is_active: false },
      { new: true }
    ).lean();
  }

  async generateSampleExcel(): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Punch Point Sample');

    // Define columns
    sheet.columns = [
      { header: 'Location', key: 'location' },
      { header: 'Description', key: 'description' },
      { header: 'Area', key: 'area' },
      { header: 'Category of Work', key: 'categoryWork' },
      { header: 'Respective Team', key: 'team' },
      { header: 'Category', key: 'category' },
      { header: 'Remarks', key: 'remarks' },
    ];

    // Style headers
    sheet.getRow(1).eachCell((cell) => {
      cell.font = {  color: { argb: 'FFFFFFFF' }, size: 12 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }, // Blue fill
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Add data validation (dropdown) to "Category" column (F2:F1000)
    for (let i = 2; i <= 1000; i++) {
      sheet.getCell(`F${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['"CRITICAL,NON_CRITICAL"'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid Input',
        error: 'Please select from the list: CRITICAL or NON_CRITICAL.',
      };

      sheet.getCell(`E${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['"PROJECT_TEAM,ASSET_TEAM,QUALITY_TEAM"'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid Input',
        error: 'Please select team from the list.',
      };
    }

    // Save file
    const uploadsDir = join(__dirname, '..', '..', 'uploads');
    if (!existsSync(uploadsDir)) mkdirSync(uploadsDir);

    const filePath = join(uploadsDir, 'punch_point_sample.xlsx');
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }

  async importFromExcel(
    file: Express.Multer.File,
    dto: UploadPunchPointDto
  ): Promise<any> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path);
    const worksheet = workbook.getWorksheet(1);

    // ✅ Ensure worksheet exists
    if (!worksheet) {
      throw new Error('Worksheet not found in Excel file.');
    }

    const dataToInsert: Partial<PunchPoint>[] = [];

    // ✅ Skip header, start from row 2
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // skip header

      const punchPoint: Partial<PunchPoint> = {
        location: row.getCell(1).text.trim(),
        description: row.getCell(2).text.trim(),
        area: row.getCell(3).text.trim(),
        categoryWork: row.getCell(4).text.trim(),
        team: row.getCell(5).text.trim(),
        category: row.getCell(6).text.trim(),
        remarks: row.getCell(7).text.trim(),
        createdOn: new Date(),
        blockId: new Types.ObjectId(dto.blockId),
        divisionId: new Types.ObjectId(dto.divisionId),
        hotoRequestId: new Types.ObjectId(dto.hotoRequestId),
        projectId: new Types.ObjectId(dto.projectId),
        userId: new Types.ObjectId(dto.userId),              
      };

      dataToInsert.push(punchPoint);
    });

    // ✅ Insert all records
    return await this.punchPointModel.insertMany(dataToInsert);
  }
  
  async upsertMultiple(data: Partial<PunchPoint & { _id?: string }>[]) {
    const ops = data.map((entry) => {
      const { _id, ...rest } = entry;

      const updateData: any = {
        ...rest,
        ...(rest.blockId && { blockId: new Types.ObjectId(rest.blockId) }),
        ...(rest.divisionId && { divisionId: new Types.ObjectId(rest.divisionId) })
      };
      

      const filter = _id
        ? { _id: new Types.ObjectId(_id) }
        : {
            location: entry.location,
            description: entry.description,
            blockId: entry.blockId ? new Types.ObjectId(entry.blockId) : undefined,
            divisionId: entry.divisionId ? new Types.ObjectId(entry.divisionId) : undefined
          };

      return {
        updateOne: {
          filter,
          update: { $set: updateData },
          upsert: true
        }
      };
    });

    return this.punchPointModel.bulkWrite(ops);
  }

  async bulkUpdateStatusCategory(
    file: Express.Multer.File,
    blockId: string,
    divisionId?: string
  ): Promise<any> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new Error('Worksheet not found in uploaded file.');
    }

    const updates: import('mongoose').AnyBulkWriteOperation<PunchPoint>[] = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header row

    const _id = row.getCell(13).text?.trim(); // Column N
    const status = row.getCell(8).text?.trim();  // Column I
    const prImpacted = row.getCell(9).text?.trim(); // Column J
    
    const projectRemarks = row.getCell(11).text?.trim(); // Column L
    const rp = row.getCell(12).text?.trim(); // Column M
    let rawDate = row.getCell(10).value;
  let targetClosureDate: string | null = null;

  if (rawDate instanceof Date) {
    // ✅ If it's already a Date, convert to ISO format
    targetClosureDate = rawDate.toISOString().split('T')[0];
  } else if (typeof rawDate === 'string') {
    // ✅ Parse if string format like "Fri Dec 12 2025..."
    const parsedDate = new Date(rawDate);
    if (!isNaN(parsedDate.getTime())) {
      targetClosureDate = parsedDate.toISOString().split('T')[0];
    }
  }

    console.log(`📄 Row ${rowNumber}:`, { _id, status, prImpacted, targetClosureDate, projectRemarks, rp });

    if (!_id || !isValidObjectId(_id)) {
      console.warn(`⛔ Skipping invalid _id at row ${rowNumber}: "${_id}"`);
      return;
    }

    if (!isValidObjectId(blockId)) {
      console.warn(`⛔ Invalid blockId: "${blockId}"`);
      return;
    }

    if (divisionId && !isValidObjectId(divisionId)) {
      console.warn(`⛔ Invalid divisionId: "${divisionId}"`);
      return;
    }

    // ✅ Safe to build update payload
    updates.push({
      updateOne: {
        filter: {
          _id: new Types.ObjectId(_id),
          blockId: new Types.ObjectId(blockId),
        },
        update: {
          $set: {
            status,
            prImpacted,
            targetClosureDate,
            projectRemarks,
            rp,
            ...(divisionId ? { divisionId: new Types.ObjectId(divisionId) } : {})
          }
        }
      }
    });

    console.log(`✅ Row ${rowNumber} update prepared for ID: ${_id}`);
  });

    

    if (updates.length === 0) {
      throw new Error('No valid updates found in Excel file.');
    }

    const result = await this.punchPointModel.bulkWrite(updates);
    console.log('✅ MongoDB bulkWrite result:', result);

    return result;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const updateFields = {
      ...(dto.category && { category: dto.category }),
      ...(dto.pr_impacted && { pr_impacted: dto.pr_impacted }),
      ...(dto.target_closure_date && { target_closure_date: formatDateYMD(dto.target_closure_date) }),
      ...(dto.project_team_remarks && { project_team_remarks: dto.project_team_remarks }),
      ...(dto.representative_name && { representative_name: dto.representative_name }),
    };

    return this.punchPointModel.findByIdAndUpdate(id, updateFields, { new: true });
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const updateFields = {
      ...(dto.status && { status: dto.status }),
      ...(dto.userId && { statusUpdatedBy: dto.userId }),
      ...(dto.actual_closure_date && { actual_closure_date: formatDateYMD(dto.actual_closure_date) }),      
    };

    return this.punchPointModel.findByIdAndUpdate(id, updateFields, { new: true });
  }

  async downloadExcel(query: any): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Punch Points');
    const categoryOptions = ['CRITICAL', 'NON_CRITICAL'];
    const prImpactedOptions = ['YES', 'NO'];

    // Define columns
    sheet.columns = [
      { header: 'Status' },
      { header: 'Message' },
      { header: 'HID', key: 'hotoRequestId' },
      { header: 'PID', key: 'projectId' },
      { header: 'BID', key: 'blockId' },
      { header: 'ID', key: '_id' },
      { header: 'Location', key: 'location' },
      { header: 'Description', key: 'description' },
      { header: 'Area', key: 'area' },
      { header: 'Category of Work', key: 'categoryWork' },
      { header: 'Respective Team', key: 'team' },
      { header: 'Remarks', key: 'remarks' },
      { header: 'Category', key: 'category' },
      { header: 'PR Impacted', key: 'pr_impacted' },
      { header: 'Traget Closure Date(DD-MM-YYYY)', key: 'target_closure_date' },
      { header: 'Remarks', key: 'project_team_remarks' },
      { header: 'RP', key: 'representative_name' },
    ];
    sheet.spliceRows(1, 0, []);

    sheet.mergeCells('A1:F1'); // Merges HID, PID, BID columns
    sheet.getCell('A1').value = 'For System Use';
    sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getCell('A1').font = {  color: { argb: 'FFFFFFFF' }, size: 12 };
    sheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'ff0000' }, // Purple fill
    };

    sheet.mergeCells('G1:L1'); // Merges HID, PID, BID columns
    sheet.getCell('G1').value = 'Read Only Columns';
    sheet.getCell('G1').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getCell('G1').font = {  color: { argb: 'FFFFFFFF' }, size: 12 };
    sheet.getCell('G1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'fdbcb4' }, // Purple fill
    };

    sheet.mergeCells('M1:Q1'); // Merges HID, PID, BID columns
    sheet.getCell('M1').value = 'Fill This Data';
    sheet.getCell('M1').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getCell('M1').font = {  color: { argb: 'FFFFFFFF' }, size: 12 };
    sheet.getCell('M1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'c9e1c6' }, // Purple fill
    };

    // Style headers
    sheet.getRow(2).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }, // Blue fill
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    const blockId     = query.blockId;
    const divisionId  = query.divisionId;
    const filter: any = {
      $and: [
        {
          $or: [
            { is_delete: false },
            { is_delete: { $exists: false } },
          ],
        },
      ],
    };
    
    if (blockId) {
      filter.blockId = new Types.ObjectId(blockId); 
    }
    
    if(divisionId){
      // filter.divisionId = new Types.ObjectId(divisionId);
    }

    if (query.location) {
      filter.$and.push({ location: { $regex: '^' + query.location, $options: 'i' } });
    }
    if (query.area) {
      filter.$and.push({ area: { $regex: '^' + query.area, $options: 'i' } });
    }
    if (query.team) {
      filter.$and.push({ team: query.team });
    }
    if (query.category) {
      filter.$and.push({ category: query.category });
    }

    const data = await this.punchPointModel.find(filter).sort({ _id: -1 }).lean();    
    
    const responseData = data.map((row) => ({
      hotoRequestId: row.hotoRequestId.toString(),
      projectId: row.projectId.toString(),
      blockId: row.blockId.toString(),
      _id: row._id.toString(),
      location: row.location || '',
      description: row.description || '',
      area: row.area || '',
      categoryWork: row.categoryWork || '',
      team: row.team || '',
      remarks: row.remarks || '',
      category: row.category || '',
      pr_impacted: row.pr_impacted || '',
      target_closure_date: row.target_closure_date || '',
      project_team_remarks: row.project_team_remarks || '',
      representative_name: row.representative_name || '',
    }));

    sheet.addRows(responseData);

    const startRow = 2;
    const endRow = responseData.length + 1;
    for (let i = startRow; i <= endRow; i++) {
    // Category dropdown in column K
    sheet.getCell(`M${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${categoryOptions.join(',')}"`],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid Category',
      error: 'Please select a valid category from the dropdown.',
    };

    // PR Impacted dropdown in column L
    sheet.getCell(`N${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${prImpactedOptions.join(',')}"`],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid PR Impact',
      error: 'Please select either YES or NO.',
    };
  }

   
  
    // Save file
    const uploadsDir = join(__dirname, '..', '..', 'uploads');
    if (!existsSync(uploadsDir)) mkdirSync(uploadsDir);

    const filePath = join(uploadsDir, 'punch-point-for-project-block.xlsx');
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }

  async downloadExcelStatus(query: any): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Punch Points');
    const categoryOptions = ['CRITICAL', 'NON_CRITICAL'];
    const prImpactedOptions = ['YES', 'NO'];
    const statusOptions = ['PENDING', 'IN_PROGRESS','COMPLETED'];

    // Define columns
    sheet.columns = [
      { header: 'Status' },
      { header: 'Message' },
      { header: 'HID', key: 'hotoRequestId' },
      { header: 'PID', key: 'projectId' },
      { header: 'BID', key: 'blockId' },
      { header: 'ID', key: '_id' },
      { header: 'Location', key: 'location' },
      { header: 'Description', key: 'description' },
      { header: 'Area', key: 'area' },
      { header: 'Category of Work', key: 'categoryWork' },
      { header: 'Respective Team', key: 'team' },
      { header: 'Remarks', key: 'remarks' },
      { header: 'Category', key: 'category' },
      { header: 'PR Impacted', key: 'pr_impacted' },
      { header: 'Traget Closure Date(DD-MM-YYYY)', key: 'target_closure_date' },
      { header: 'Remarks', key: 'project_team_remarks' },
      { header: 'RP', key: 'representative_name' },
      { header: 'Status', key: 'status' },
      { header: 'Actual Closure Date(DD-MM-YYYY)', key: 'actual_closure_date' },
    ];
    sheet.spliceRows(1, 0, []);

    sheet.mergeCells('A1:F1'); // Merges HID, PID, BID columns
    sheet.getCell('A1').value = 'For System Use';
    sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getCell('A1').font = {  color: { argb: 'FFFFFFFF' }, size: 12 };
    sheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'ff0000' }, // Purple fill
    };

    sheet.mergeCells('G1:Q1'); // Merges HID, PID, BID columns
    sheet.getCell('G1').value = 'Read Only Columns';
    sheet.getCell('G1').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getCell('G1').font = {  color: { argb: 'FFFFFFFF' }, size: 12 };
    sheet.getCell('G1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'fdbcb4' }, // Purple fill
    };

    sheet.mergeCells('R1:S1'); // Merges HID, PID, BID columns
    sheet.getCell('R1').value = 'Fill This Data';
    sheet.getCell('R1').alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getCell('R1').font = {  color: { argb: 'FFFFFFFF' }, size: 12 };
    sheet.getCell('R1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'c9e1c6' }, // Purple fill
    };

    // Style headers
    sheet.getRow(2).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }, // Blue fill
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    const blockId     = query.blockId;
    const divisionId  = query.divisionId;
    const filter: any = {
      $and: [
        {
          $or: [
            { is_delete: false },
            { is_delete: { $exists: false } },
          ],
        },
      ],
    };
    
    if (blockId) {
      filter.blockId = new Types.ObjectId(blockId); 
    }
    
    if(divisionId){
      // filter.divisionId = new Types.ObjectId(divisionId);
    }

    if (query.location) {
      filter.$and.push({ location: { $regex: '^' + query.location, $options: 'i' } });
    }
    if (query.area) {
      filter.$and.push({ area: { $regex: '^' + query.area, $options: 'i' } });
    }
    if (query.team) {
      filter.$and.push({ team: query.team });
    }
    if (query.category) {
      filter.$and.push({ category: query.category });
    }

    const data = await this.punchPointModel.find(filter).sort({ _id: -1 }).lean();    
    
    const responseData = data.map((row) => ({
      hotoRequestId: row.hotoRequestId.toString(),
      projectId: row.projectId.toString(),
      blockId: row.blockId.toString(),
      _id: row._id.toString(),
      location: row.location || '',
      description: row.description || '',
      area: row.area || '',
      categoryWork: row.categoryWork || '',
      team: row.team || '',
      remarks: row.remarks || '',
      category: row.category || '',
      pr_impacted: row.pr_impacted || '',
      target_closure_date: formatDateDMY(row.target_closure_date) || '',
      project_team_remarks: row.project_team_remarks || '',
      representative_name: row.representative_name || '',
      status: row.status || '',
      actual_closure_date: formatDateDMY(row.actual_closure_date) || '',

    }));
    sheet.addRows(responseData);
    sheet.columns.forEach((column) => {
      let maxLength = 10; // Default min width
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, cellValue.length + 2); // Add some padding
      });
      column.width = maxLength;
    });
    const startRow = 3;
    const endRow = responseData.length + 1;
    for (let i = startRow; i <= endRow; i++) {
      // Category dropdown in column K
      sheet.getCell(`M${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${categoryOptions.join(',')}"`],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid Category',
        error: 'Please select a valid category from the dropdown.',
      };

      // PR Impacted dropdown in column L
      sheet.getCell(`N${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${prImpactedOptions.join(',')}"`],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid PR Impact',
        error: 'Please select either YES or NO.',
      };

      sheet.getCell(`R${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${statusOptions.join(',')}"`],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid Status',
        error: 'Please select Pending,In Progress or Completed.',
      };
    }

    await sheet.protect('securePassword123', {
      selectLockedCells: true,
      selectUnlockedCells: true,
    });

    const editableColumns = ['R', 'S'];
    for (let col of editableColumns) {
      for (let row = startRow; row <= endRow; row++) {
        sheet.getCell(`${col}${row}`).protection = { locked: false };
      }
    }
   
  
    // Save file
    const uploadsDir = join(__dirname, '..', '..', 'uploads');
    if (!existsSync(uploadsDir)) mkdirSync(uploadsDir);

    const filePath = join(uploadsDir, 'punch-point-for-project-block.xlsx');
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }

  async processExcel(filePath: string, originalName: string, body: any) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.getWorksheet(1);

    if (!sheet) {
      throw new Error('Worksheet 1 not found in the uploaded Excel file.');
    }
    // Insert headers in A and B (Status, Message)
    const headerRow = sheet.getRow(2);
    headerRow.getCell(1).value = 'Status';
    headerRow.getCell(2).value = 'Message';
    headerRow.commit();

    let successCount = 0;
    let failureCount = 0;

    for (let i = 3; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);

      const hotoRequestId = new Types.ObjectId(row.getCell(3).value?.toString().trim()); // C
      const projectId = new Types.ObjectId(row.getCell(4).value?.toString().trim()); // D
      const blockId = new Types.ObjectId(row.getCell(5).value?.toString().trim()); // E
      const _id = new Types.ObjectId(row.getCell(6).value?.toString().trim()); // F

      const category = row.getCell(13).value?.toString().trim(); // M
      const prImpacted = row.getCell(14).value?.toString().trim(); // N
      const targetClosureDate = row.getCell(15).value?.toString().trim(); // O
      const remarks = row.getCell(16).value?.toString().trim(); // P
      const repName = row.getCell(17).value?.toString().trim(); // Q

      try {
        const updateResult = await this.punchPointModel.updateOne(
          {
            _id,
            hotoRequestId,
            projectId,
            blockId,
          },
          {
            category,
            pr_impacted: prImpacted,
            target_closure_date: formatDateYMD(targetClosureDate),
            project_team_remarks: remarks,
            representative_name: repName,
            updatedAt: new Date(),
          },
        );

        if (updateResult.modifiedCount > 0 || updateResult.upsertedCount > 0) {
          row.getCell(1).value = 'Success'; // A
          row.getCell(2).value = 'Record updated'; // B
          successCount++;
        } else {
          row.getCell(1).value = 'Fail';
          row.getCell(2).value = 'No matching record found';
          failureCount++;
        }
      } catch (error) {
        row.getCell(1).value = 'Fail';
        row.getCell(2).value = 'Update error';
        failureCount++;
      }

      row.commit();
    }

    const updatedFilePath = filePath.replace('.xlsx', '-updated.xlsx');
    await workbook.xlsx.writeFile(updatedFilePath);

    // Save to UploadLog collection
    await this.uploadLogModel.create({
      userId: new Types.ObjectId(body.userId), 
      fileName: originalName,
      projectId : new Types.ObjectId(body.projectId), 
      blockId: new Types.ObjectId(body.blockId), 
      divisionId: new Types.ObjectId(body.divisionId),
      hotoRequestId: new Types.ObjectId(body.hotoRequestId),
      uploadedOn: new Date(),
      successCount,
      failureCount,
      downloadFilePath: updatedFilePath,
    });

    return {
      message: 'File processed',
      updatedFilePath,
      successCount,
      failureCount,
    };
  }

  async processStatusExcel(filePath: string, originalName: string, body: any) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.getWorksheet(1);
    
    if (!sheet) {
      throw new Error('Worksheet 1 not found in the uploaded Excel file.');
    }

    const headerRow = sheet.getRow(2);
    headerRow.getCell(1).value = 'Status';
    headerRow.getCell(2).value = 'Message';
    headerRow.commit();
    
    let successCount = 0;
    let failureCount = 0;

    for (let i = 3; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);

      const hotoRequestId = new Types.ObjectId(row.getCell(3).value?.toString().trim()); // C
      const projectId = new Types.ObjectId(row.getCell(4).value?.toString().trim()); // D
      const blockId = new Types.ObjectId(row.getCell(5).value?.toString().trim()); // E
      const _id = new Types.ObjectId(row.getCell(6).value?.toString().trim()); // F      
      const status = row.getCell(18).value?.toString().trim(); // R
      const actual_closure_date = row.getCell(19).value?.toString().trim(); // S

      try {
        const updateResult = await this.punchPointModel.updateOne(
          {
            _id,
            hotoRequestId,
            projectId,
            blockId,
          },
          {
            actual_closure_date: formatDateYMD(actual_closure_date),
            status: (status!='')?status:'PENDING',
            updatedAt: new Date(),
          },
        );

        if (updateResult.modifiedCount > 0 || updateResult.upsertedCount > 0) {
          row.getCell(1).value = 'Success'; // A
          row.getCell(2).value = 'Record updated'; // B
          successCount++;
        } else {
          row.getCell(1).value = 'Fail';
          row.getCell(2).value = 'No matching record found';
          failureCount++;
        }
      } catch (error) {
        row.getCell(1).value = 'Fail';
        row.getCell(2).value = 'Update error';
        failureCount++;
      }

      row.commit();
    }

    const updatedFilePath = filePath.replace('.xlsx', '-updated.xlsx');
    await workbook.xlsx.writeFile(updatedFilePath);

    // Save to UploadLog collection
    await this.uploadSatusLogModel.create({
      userId: new Types.ObjectId(body.userId), 
      fileName: originalName,
      projectId : new Types.ObjectId(body.projectId), 
      blockId: new Types.ObjectId(body.blockId), 
      divisionId: new Types.ObjectId(body.divisionId),
      hotoRequestId: new Types.ObjectId(body.hotoRequestId),
      uploadedOn: new Date(),
      successCount,
      failureCount,
      downloadFilePath: updatedFilePath,
    });

    return {
      message: 'File processed',
      updatedFilePath,
      successCount,
      failureCount,
    };
  }

  async downloadSampleExcel(): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Punch Point Sample');

    // Define columns
    sheet.columns = [
      { header: 'Location', key: 'location' },
      { header: 'Description', key: 'description' },
      { header: 'Area', key: 'area' },
      { header: 'Category of Work', key: 'categoryWork' },
      { header: 'Respective Team', key: 'team' },
      { header: 'Category', key: 'category' },
      { header: 'Remarks', key: 'remarks' },
    ];

    // Style headers
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }, // Blue fill
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Save file
    const uploadsDir = join(__dirname, '..', '..', 'uploads');
    if (!existsSync(uploadsDir)) mkdirSync(uploadsDir);

    const filePath = join(uploadsDir, 'punch_point_sample.xlsx');
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  } 

  async getUploadLogs(query: any) {
    const draw = parseInt(query.draw) || 1;
    const start = parseInt(query.start) || 0;
    const length = parseInt(query.length) || 10;
    const search = query.search?.value || '';

    const match: any = {};

    // ✅ Search filter
    if (search) {
      match.fileName = { $regex: search, $options: 'i' };
    }

    // ✅ ID filters
    if (query.projectId && isValidObjectId(query.projectId)) {
      match.projectId = new Types.ObjectId(query.projectId);
    }
    if (query.blockId && isValidObjectId(query.blockId)) {
      match.blockId = new Types.ObjectId(query.blockId);
    }
    if (query.divisionId && isValidObjectId(query.divisionId)) {
      match.divisionId = new Types.ObjectId(query.divisionId);
    }
    if (query.hotoRequestId && isValidObjectId(query.hotoRequestId)) {
      match.hotoRequestId = new Types.ObjectId(query.hotoRequestId);
    }

    // ✅ Aggregation Pipeline
    const pipeline: any[] = [
      { $match: match },

      // 🔁 Join Users
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

      // 🔁 Join Projects
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },

      // 🔁 Join Blocks
      {
        $lookup: {
          from: 'blocks',
          localField: 'blockId',
          foreignField: '_id',
          as: 'block',
        },
      },
      { $unwind: { path: '$block', preserveNullAndEmptyArrays: true } },

      // 🔁 Join Divisions
      {
        $lookup: {
          from: 'divisions',
          localField: 'divisionId',
          foreignField: '_id',
          as: 'division',
        },
      },
      { $unwind: { path: '$division', preserveNullAndEmptyArrays: true } },

      // 🔁 Join HOTO Requests
      {
        $lookup: {
          from: 'hotorequests',
          localField: 'hotoRequestId',
          foreignField: '_id',
          as: 'hotoRequest',
        },
      },
      { $unwind: { path: '$hotoRequest', preserveNullAndEmptyArrays: true } },

      // ✅ Count total after filters
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { uploadedOn: -1 } },
            { $skip: start },
            { $limit: length },
            {
              $project: {
                _id: 1,
                fileName: 1,
                uploadedOn: 1,
                successCount: 1,
                failureCount: 1,
                downloadFilePath: 1,
                userName: '$user.name',
                projectName: '$project.name',
                blockName: '$block.name',
                divisionName: '$division.name',
                hotoRequestName: '$hotoRequest.name',
              },
            },
          ],
        },
      },

      // ✅ Format metadata
      {
        $unwind: {
          path: '$metadata',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          total: '$metadata.total',
          data: 1,
        },
      },
    ];

    const result = await this.uploadLogModel.aggregate(pipeline);

    const total = result[0]?.total || 0;
   
    const responseData =  result[0]?.data.map((row) => ({
      _id: row._id.toString(),
      fileName: row.fileName,
      uploadedOn: row.uploadedOn,
      successCount: row.successCount, 
      failureCount: row.failureCount,
      downloadFilePath: row.downloadFilePath,
      userName: row.userName || 'N/A',
      blockName: row.blockName || 'N/A',
    }));

    return {
      draw,
      recordsTotal: total,
      recordsFiltered: total,
      data: responseData,
    };
  }

  async acknowledgeByBlock(body: any) {
    const result = await this.punchPointModel.updateMany(
      { blockId: new Types.ObjectId(body.blockId) }, 
      {
        $set: {
          acknowledgeStatus: 'acknowledged',
          acknowledgedBy: body.userId,
          acknowledgedOn: new Date()
        }
      }
    );

    const result2 = await this.blockModel.updateMany(
      { _id: new Types.ObjectId(body.blockId) }, 
      {
        $set: {
          acknowledgeStatus: 'acknowledged',
          acknowledgedBy: body.userId,
          acknowledgedOn: new Date(),
          assetTeamPunchPointAckBy : new Types.ObjectId(body.userId),
          assetTeamPunchPointAckDate : new Date(),
          assetTeamPunchPointStatus : 'acknowledged',
          qualityTeamPunchPointAckBy : new Types.ObjectId(body.userId),
          qualityTeamPunchPointAckDate : new Date(),
          qualityTeamPunchPointStatus : 'acknowledged',
        }
      }
    );

    return {
      modifiedCount: result.modifiedCount,
      message: `Acknowledged ${result.modifiedCount} logs for block ${body.blockId}`
    };
  }

  async getUploadStatusLogs(query: any) {
    const draw = parseInt(query.draw) || 1;
    const start = parseInt(query.start) || 0;
    const length = parseInt(query.length) || 10;
    const search = query.search?.value || '';

    const match: any = {};

    if (search) {
      match.fileName = { $regex: search, $options: 'i' };
    }

    if (query.projectId && isValidObjectId(query.projectId)) {
      match.projectId = new Types.ObjectId(query.projectId);
    }
    if (query.blockId && isValidObjectId(query.blockId)) {
      match.blockId = new Types.ObjectId(query.blockId);
    }
    if (query.divisionId && isValidObjectId(query.divisionId)) {
      match.divisionId = new Types.ObjectId(query.divisionId);
    }
    if (query.hotoRequestId && isValidObjectId(query.hotoRequestId)) {
      match.hotoRequestId = new Types.ObjectId(query.hotoRequestId);
    }
  
    const pipeline: any[] = [
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }, 
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },  
      {
        $lookup: {
          from: 'blocks',
          localField: 'blockId',
          foreignField: '_id',
          as: 'block',
        },
      },
      { $unwind: { path: '$block', preserveNullAndEmptyArrays: true } },    
      {
        $lookup: {
          from: 'divisions',
          localField: 'divisionId',
          foreignField: '_id',
          as: 'division',
        },
      },
      { $unwind: { path: '$division', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'hotorequests',
          localField: 'hotoRequestId',
          foreignField: '_id',
          as: 'hotoRequest',
        },
      },
      { $unwind: { path: '$hotoRequest', preserveNullAndEmptyArrays: true } },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { uploadedOn: -1 } },
            { $skip: start },
            { $limit: length },
            {
              $project: {
                _id: 1,
                fileName: 1,
                uploadedOn: 1,
                successCount: 1,
                failureCount: 1,
                downloadFilePath: 1,
                userName: '$user.name',
                projectName: '$project.name',
                blockName: '$block.name',
                divisionName: '$division.name',
                hotoRequestName: '$hotoRequest.name',
              },
            },
          ],
        },
      },      
      {
        $unwind: {
          path: '$metadata',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          total: '$metadata.total',
          data: 1,
        },
      },
    ];

    const result = await this.uploadSatusLogModel.aggregate(pipeline);

    const total = result[0]?.total || 0;
   
    const responseData =  result[0]?.data.map((row) => ({
      _id: row._id.toString(),
      fileName: row.fileName,
      uploadedOn: row.uploadedOn,
      successCount: row.successCount, 
      failureCount: row.failureCount,
      downloadFilePath: row.downloadFilePath,
      userName: row.userName || 'N/A',
      blockName: row.blockName || 'N/A',
    }));

    return {
      draw,
      recordsTotal: total,
      recordsFiltered: total,
      data: responseData,
    };
  }
}
