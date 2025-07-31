import { Injectable } from '@nestjs/common';
import { CreateTeamMobilisationDto } from './dto/create-team-mobilisation.dto';
import { UpdateTeamMobilisationDto } from './dto/update-team-mobilisation.dto';
import { Connection, Types } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class TeamMobilisationService {
    constructor(@InjectConnection() private connection: Connection) {}

  async getHotoRequests() {
    const collection = this.connection.collection('hotorequest'); // ✅ exact name from Compass
    return await collection.find({}).toArray(); // fetch all documents
  }

  async getHotoRequestById(id: string) {
    const hotoRequest = await this.connection.collection('hotorequest').findOne({ _id: new Types.ObjectId(id) });
    const blocks = await this.connection.collection('hoto_request_block').find({ hoto_request_id: new Types.ObjectId(id) }).toArray();

    return {
      hotoRequest,
      blocks,
    };
  }


  create(CreateTeamMobilisationDto: CreateTeamMobilisationDto) {
    return 'This action adds a new teamMobilisation';
  }

  findAll() {
    return `This action returns all teamMobilisation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} teamMobilisation`;
  }

  update(id: number, updateTeamMobilisationDto: UpdateTeamMobilisationDto) {
    return `This action updates a #${id} teamMobilisation`;
  }

  remove(id: number) {
    return `This action removes a #${id} teamMobilisation`;
  }
}
