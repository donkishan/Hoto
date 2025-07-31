import { IsEnum, IsOptional, IsString } from "class-validator";

export enum Status {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export class UpdateStatusDto {
    @IsOptional()
    @IsString()
    actual_closure_date?: string;

    @IsOptional()
    @IsEnum(Status)
    status?: Status;

    @IsString()
    userId:string;
}