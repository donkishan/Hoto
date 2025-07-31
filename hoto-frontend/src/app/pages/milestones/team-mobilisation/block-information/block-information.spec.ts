import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockInformation } from './block-information';

describe('BlockInformation', () => {
  let component: BlockInformation;
  let fixture: ComponentFixture<BlockInformation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockInformation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockInformation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
