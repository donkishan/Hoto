import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreatePvConfigurationDto {
  @IsOptional()
  @IsMongoId()
  projectId: string; // ✅ Now required

  @IsString()
  solarModule: string;

  @IsString()
  solarPower: string;

  @IsString()
  solarCount: string;

  @IsString()
  inverter: string;

  @IsString()
  inverterPower: string;

  @IsString()
  inverterCount: string;

  @IsString()
  installationType: string;

  @IsString()
  trackingSystem: string;
}
