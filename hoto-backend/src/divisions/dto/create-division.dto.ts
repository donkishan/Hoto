import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateDivisionDto {
    @IsString()
    @IsNotEmpty()
    division_name: string;

    @IsString()
    @IsNotEmpty()
    created_by: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsBoolean()
    is_delete?: boolean;
}
