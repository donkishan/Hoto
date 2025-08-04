import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentationBlock } from './documentation-block';

describe('DocumentationBlock', () => {
  let component: DocumentationBlock;
  let fixture: ComponentFixture<DocumentationBlock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentationBlock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentationBlock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
