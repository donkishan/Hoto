import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DocumentDto {
  @IsString()
  @IsNotEmpty()
  documentName: string;

  @IsNotEmpty()
  noOfDocuments: string;

  @IsString()
  @IsNotEmpty()
  division: string;

  @IsNotEmpty()
  @IsString()
  divisionName: string;
}

export class CreateDocumentationDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  projectName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents: DocumentDto[];
}
