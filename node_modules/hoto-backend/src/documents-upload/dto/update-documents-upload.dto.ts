import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentsUploadDto } from './create-documents-upload.dto';

export class UpdateDocumentsUploadDto extends PartialType(CreateDocumentsUploadDto) {}
