import { IsArray, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateDocumentsUploadDto {
  @IsNotEmpty()
  @IsString()
  documentId: string;

  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsArray()
  @IsString({ each: true })
  uploadedLinks: string[];

  @IsOptional()
  @IsNumber()
  uploadedCount?: number;

   @IsOptional()
  @IsNumber()
  acceptedByOM?: number;
}
