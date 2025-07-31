import { PartialType } from '@nestjs/mapped-types';
import { CreatePunchPointDto } from './create-punch-point.dto';
import { IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export enum TeamType {
  PROJECT_TEAM = 'PROJECT_TEAM',
  ASSET_TEAM = 'ASSET_TEAM',
  QUALITY_TEAM = 'QUALITY_TEAM',
}

export enum CategoryType {
  CRITICAL = 'CRITICAL',
  NON_CRITICAL = 'NON_CRITICAL',
}
export class UpdatePunchPointDto extends PartialType(CreatePunchPointDto) {
    @IsNotEmpty()
    @IsString()
    location: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    area: string;

    @IsNotEmpty()
    @IsString()
    categoryWork: string;

    @IsNotEmpty()
    @IsEnum(TeamType)
    team: TeamType;

    @IsNotEmpty()
    @IsEnum(CategoryType)
    category: CategoryType;

    @IsNotEmpty()
    @IsString()
    remarks: string;

    @IsNotEmpty()
    @IsMongoId()
    divisionId: string;

    @IsNotEmpty()
    @IsMongoId()
    blockId: string;

    @IsNotEmpty()
    @IsMongoId()
    hotoRequestId: string;

    @IsNotEmpty()
    @IsMongoId()
    projectId: string;

    @IsNotEmpty()
    @IsMongoId()
    userId: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsBoolean()
    is_delete?: boolean;
}
