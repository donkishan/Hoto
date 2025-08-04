import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsUploadService } from './documents-upload.service';
import { DocumentsUploadController } from './documents-upload.controller';
import { DocumentsUploadSchema } from './schema/document-upload.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DocumentsUpload', schema: DocumentsUploadSchema },
    ]),
  ],
  controllers: [DocumentsUploadController],
  providers: [DocumentsUploadService],
})
export class DocumentsUploadModule {}
