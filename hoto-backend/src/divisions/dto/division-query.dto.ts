import { IsOptional, IsString } from 'class-validator';

export class DivisionsQueryDto {
  @IsOptional() draw?: string;
  @IsOptional() start?: string;
  @IsOptional() length?: string;

  @IsOptional() @IsString() ['search[value]']?: string;
  @IsOptional() @IsString() ['order[0][column]']?: string;
  @IsOptional() @IsString() ['order[0][dir]']?: string;
  @IsOptional() @IsString() ['columns[0][data]']?: string;
}
