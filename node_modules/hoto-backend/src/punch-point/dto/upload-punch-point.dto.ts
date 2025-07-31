import { IsNotEmpty, IsString } from 'class-validator';

export class UploadPunchPointDto {
  @IsNotEmpty()
  @IsString()
  blockId: string;

  @IsNotEmpty()
  @IsString()
  divisionId: string;

  @IsNotEmpty()
  @IsString()
  hotoRequestId: string;

  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;
}
