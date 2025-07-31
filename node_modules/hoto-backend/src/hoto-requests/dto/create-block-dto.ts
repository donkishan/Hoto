import { IsNotEmpty, IsNumber, IsOptional, IsString, IsMongoId } from 'class-validator';

export class CreateBlockDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;  // Just a string like "PRJ-001"

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  capacity: number;

  @IsNotEmpty()
  @IsString()
  startDate: string;

  @IsNotEmpty()
  @IsString()
  endDate: string;

  
}
