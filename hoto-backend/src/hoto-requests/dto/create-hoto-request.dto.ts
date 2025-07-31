// dto/create-hoto-request.dto.ts
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateHotoRequestDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsNotEmpty()
  @IsString()
  projectCode: string;

  @IsNotEmpty()
  @IsString()
  capacity: string;

  @IsNotEmpty()
  @IsString()
  completionType: string;

  @IsNotEmpty()
  @IsString()
  initiatedDate: string;

  @IsOptional()
  @IsString()
  initiatedById: string;

  @IsOptional()
  @IsString()
  codDate: string;

  @IsOptional()
  certificateFileName: any[];

  @IsOptional()
  @IsString()
  certificateUrl: string;

  @IsOptional()
  @IsString()
  status: string; // 'Draft' or 'Submitted'

}
