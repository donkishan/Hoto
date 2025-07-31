import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadStatus } from './bulk-upload-status';

describe('BulkUploadStatus', () => {
  let component: BulkUploadStatus;
  let fixture: ComponentFixture<BulkUploadStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkUploadStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkUploadStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
