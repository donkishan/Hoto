import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectBulkUpload } from './project-bulk-upload';

describe('ProjectBulkUpload', () => {
  let component: ProjectBulkUpload;
  let fixture: ComponentFixture<ProjectBulkUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectBulkUpload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectBulkUpload);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
