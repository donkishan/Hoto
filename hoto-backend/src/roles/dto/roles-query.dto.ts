import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class RolesQueryDto {
   @IsOptional()
  @IsString()
  draw?: string;

  @IsOptional()
  @IsString()
  start?: string; // offset

  @IsOptional()
  @IsString()
  length?: string; // limit

  @IsOptional()
  @IsString()
  ['search[value]']?: string;

  @IsOptional()
  @IsString()
  ['order[0][column]']?: string;

  @IsOptional()
  @IsString()
  ['columns[0][data]']?: string;
}
