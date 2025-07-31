import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Division, DivisionDocument } from './schemas/division.schema';
import { Model } from 'mongoose';
import { DivisionsQueryDto } from './dto/division-query.dto';

@Injectable()
export class DivisionsService {
  constructor(
    @InjectModel(Division.name) private divisionModel: Model<DivisionDocument>,
  ) {}

  async create(createDivisionDto: CreateDivisionDto) {
    const existingDivision = await this.divisionModel.findOne({
      division_name: {
        $regex: `^${createDivisionDto.division_name}$`,
        $options: 'i',
      },
    });

    if (existingDivision) {
      throw new BadRequestException(`Division "${createDivisionDto.division_name}" already exists.`);
    }

    const now = new Date();

    const createDivision = new this.divisionModel({
      ...createDivisionDto,
      create_date: now,
      last_update: now,
      is_active: true,
      is_delete: false,
    });

    return createDivision.save();
  }

  async findAll() {
    return this.divisionModel.find({ is_delete: false }).sort({ divisionCode: 1 });
  }

  async dataTable(query: DivisionsQueryDto) {
    const {
      start = '0',
      length = '10',
      ['search[value]']: search = '',
      ['order[0][column]']: sortColumn = '0',
      ['order[0][dir]']: sortOrder = 'asc',
      ['columns[0][data]']: firstColumn = 'divisionCode',
    } = query;

    const skip = parseInt(start);
    const limit = parseInt(length);

    const match: any = { is_delete: false };

    if (search) {
      match['$or'] = [
        { divisionCode: { $regex: search, $options: 'i' } },
        { divisionName: { $regex: search, $options: 'i' } },
      ];
    }

    const sort: any = {};
    sort[firstColumn] = sortOrder === 'asc' ? 1 : -1;

    const [recordsTotal, data] = await Promise.all([
      this.divisionModel.countDocuments({ is_delete: false }),
      this.divisionModel
        .find(match)
        .sort(sort)
        .skip(skip)
        .limit(limit),
    ]);

    const recordsFiltered = await this.divisionModel.countDocuments(match);

    return {
      draw: Number(query.draw) || 0,
      recordsTotal,
      recordsFiltered,
      data,
    };
  }
  
  async findOne(id: string) {
    const division = await this.divisionModel.findById(id);
    if (!division) {
      throw new NotFoundException(`Division with ID "${id}" not found.`);
    }
    return division;
  }

  async update(id: string, updateDivisionDto: UpdateDivisionDto) {
    const updated = await this.divisionModel.findByIdAndUpdate(
      id,
      {
        ...updateDivisionDto,
        last_update: new Date(),
      },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException(`Division with ID "${id}" not found.`);
    }
    return updated;
  }

  async remove(id: string) {
    const result = await this.divisionModel.findByIdAndUpdate(
      id,
      { is_delete: true, last_update: new Date() },
      { new: true },
    );
    if (!result) {
      throw new NotFoundException(`Division with ID "${id}" not found.`);
    }
    return { message: `Division "${result.divisionName}" marked as deleted.` };
  }
}
