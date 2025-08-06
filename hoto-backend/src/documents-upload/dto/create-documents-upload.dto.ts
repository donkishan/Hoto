import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

class UploadedLinkDto {
  @IsString()
  link: string;

  @IsString()
  status: 'approved' | 'rejected' | 'pending';
}

export class CreateDocumentsUploadDto {
  @IsNotEmpty()
  @IsString()
  documentId: string;

  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UploadedLinkDto)
  uploadedLinks: UploadedLinkDto[];

  @IsOptional()
  @IsNumber()
  uploadedCount?: number;

  @IsOptional()
  @IsNumber()
  acceptedByOM?: number;

  @IsOptional()
  @IsNumber()
  rejectedByOM?: number;
}
