import { IsOptional, IsString, ValidateNested, IsArray, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePvConfigurationDto } from '../dto/create-pv-configuration.dto';


export class CreateProjectDto {
 // Step 1 - Project Data
  @IsString()
  projectId: string; 
  
  @IsString()
  spvName: string;

  @IsString()
  projectName: string;

  @IsString()
  coordinates: string;

  @IsString()
  region: string;

  @IsString()
  country: string;

  @IsString()
  timezone: string;

  // Step 2 - Project Site Data
  @IsString()
  plantPower: string;

  @IsString()
  googleEarth: string;

  @IsString()
  constructionStart: string;

  @IsString()
  commissioning: string;

  @IsString()
  siteDescription: string;

  // Step 3 - Plant Configuration and Design
  @IsString()
  globalProject: string;

  @IsString()
  ratedCapacityDC: string;

  @IsString()
  ratedCapacityAC: string;

  @IsString()
  dcAcRatio: string;

  // Step 5 - PV System - Racking Design
  @IsString()
  orientation: string;

  @IsString()
  rowSpacing: string;

  @IsString()
  height: string;

  @IsString()
  gcr: string;

  @IsString()
  areaLimitations: string;

  @IsString()
  modulesPerString: string;

  @IsString()
  stringsPerInverter: string;

  @IsString()
  pnomRatio: string;

  @IsString()
  cleaningEvent: string;

  @IsString()
  roboticCleaning: string;
  
  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePvConfigurationDto)
  pvConfigurations?: CreatePvConfigurationDto[];

}
