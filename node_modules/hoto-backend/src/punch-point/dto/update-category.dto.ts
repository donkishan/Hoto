import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum CategoryType {
  CRITICAL = 'CRITICAL',
  NON_CRITICAL = 'NON_CRITICAL',  
}

export enum PRImpact {
  NO = 'NO',
  YES = 'YES',
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsEnum(CategoryType)
  category?: CategoryType;

  @IsOptional()
  @IsEnum(PRImpact)
  pr_impacted?: PRImpact;

  @IsOptional()
  @IsString()
  target_closure_date?: string;

  @IsOptional()
  @IsString()
  project_team_remarks?: string;

  @IsOptional()
  @IsString()
  representative_name?: string;
}
