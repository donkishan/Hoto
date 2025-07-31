import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  role_name: string;

  @IsString()
  @IsNotEmpty()
  mst_divisions_id: string;


  @IsString()
  @IsNotEmpty()
  created_by: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_delete?: boolean;
}
