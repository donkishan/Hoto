import {
  IsOptional,
  IsString,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SearchDto } from './search.dto';

export class ColumnDto {
  @IsOptional()
  @IsString()
  data?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  searchable?: boolean;

  @IsOptional()
  @IsBoolean()
  orderable?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => SearchDto)
  search?: SearchDto;
}
