import { IsArray, IsNotEmpty, IsMongoId } from 'class-validator';

export class AssignUsersDto {
  @IsMongoId()
  @IsNotEmpty()
  block_id: string;

  @IsMongoId()
  @IsNotEmpty()
  division: string;

  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsMongoId()
  @IsNotEmpty()
  hotoRequestId: string;

  @IsMongoId()
  @IsNotEmpty()
  projectId: string;

  @IsArray()
  @IsNotEmpty()
  @IsMongoId({ each: true })
  users_id: string[];
}
