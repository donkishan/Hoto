import {
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePvConfigurationDto } from './create-pv-configuration.dto';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  projectId: string; 

  @IsOptional()
  @IsString()
  spvName?: string;

  @IsOptional()
  @IsString()
  projectName?: string;

  @IsOptional()
  @IsString()
  coordinates?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  plantPower?: string;

  @IsOptional()
  @IsString()
  googleEarth?: string;

  @IsOptional()
  @IsString()
  constructionStart?: string;

  @IsOptional()
  @IsString()
  commissioning?: string;

  @IsOptional()
  @IsString()
  siteDescription?: string;

  @IsOptional()
  @IsString()
  globalProject?: string;

  @IsOptional()
  @IsString()
  ratedCapacityDC?: string;

  @IsOptional()
  @IsString()
  ratedCapacityAC?: string;

  @IsOptional()
  @IsString()
  dcAcRatio?: string;

  @IsOptional()
  @IsString()
  orientation?: string;

  @IsOptional()
  @IsString()
  rowSpacing?: string;

  @IsOptional()
  @IsString()
  height?: string;

  @IsOptional()
  @IsString()
  gcr?: string;

  @IsOptional()
  @IsString()
  areaLimitations?: string;

  @IsOptional()
  @IsString()
  modulesPerString?: string;

  @IsOptional()
  @IsString()
  stringsPerInverter?: string;

  @IsOptional()
  @IsString()
  pnomRatio?: string;

  @IsOptional()
  @IsString()
  cleaningEvent?: string;

  @IsOptional()
  @IsString()
  roboticCleaning?: string;

  @IsOptional()
  @IsString()
  status: string;

  // ✅ Add this at the end
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePvConfigurationDto)
  pvConfigurations?: CreatePvConfigurationDto[];
}
