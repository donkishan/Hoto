import { PartialType } from '@nestjs/mapped-types';
import { CreateHotoRequestDto } from './create-hoto-request.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateHotoRequestDto extends PartialType(CreateHotoRequestDto) {
    @IsNotEmpty()
    @IsString()
    projectId: string;

    @IsNotEmpty()
    @IsString()
    projectCode: string;

    @IsNotEmpty()
    @IsString()
    capacity: string;

    @IsNotEmpty()
    @IsString()
    completionType: string;

    @IsNotEmpty()
    @IsString()
    initiatedDate: string;

    @IsOptional()
    @IsString()
    initiatedById: string;

    @IsOptional()
    @IsString()
    codDate: string;

    @IsOptional()
    certificateFileName: any[];

    @IsOptional()
    @IsString()
    certificateUrl: string;

    @IsOptional()
    @IsString()
    status: string;
}
