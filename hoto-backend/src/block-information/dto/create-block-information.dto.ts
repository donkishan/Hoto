import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateBlockInformationDto {

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

    @IsNotEmpty()
    @IsString()
    division: string;    
}
