import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsUploadService } from './documents-upload.service';

describe('DocumentsUploadService', () => {
  let service: DocumentsUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentsUploadService],
    }).compile();

    service = module.get<DocumentsUploadService>(DocumentsUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
