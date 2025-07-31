import { IsOptional, IsString, IsMongoId, IsDateString, IsNotEmpty } from 'class-validator';
import { Types} from 'mongoose';

export class CreatePunchPointDto {
  // Punch Point Details
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  categoryWork?: string;

  @IsOptional()
  @IsString()
  team?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  blockId?: string | Types.ObjectId;  // ✅ ALLOW BOTH TYPES

  @IsOptional()
  divisionId?: string | Types.ObjectId;

  @IsOptional()
  @IsString()
  createdOn?: string;

  // Project Entry Fields

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  prImpacted?: string;

  @IsOptional()
  @IsDateString()
  targetClosureDate?: string;

  @IsOptional()
  @IsString()
  rp?: string;
  @IsOptional()
  @IsString()
  projectRemarks?:string;

  @IsOptional()
  @IsString()
  readonly _id?: string;

  @IsNotEmpty()
  @IsString()
  hotoRequestId?: string;

  @IsNotEmpty()
  @IsString()
  projectId?: string;

  @IsNotEmpty()
  @IsString()
  userId?: string;
}
