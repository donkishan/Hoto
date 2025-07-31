import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class SearchDto {
  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsBoolean()
  regex?: boolean;
}
