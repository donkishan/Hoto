import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentationList } from './documentation-list';

describe('DocumentationList', () => {
  let component: DocumentationList;
  let fixture: ComponentFixture<DocumentationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentationList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentationList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
