import { PartialType } from '@nestjs/mapped-types';
import { CreateBlockInformationDto } from './create-block-information.dto';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateBlockInformationDto extends PartialType(CreateBlockInformationDto) {
    @IsNotEmpty()
    @IsString()
    first_name: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    role_mame: string;

    @IsNotEmpty()
    @IsString()
    deployed_date: string;

    @IsString()
    division: string;    
}
