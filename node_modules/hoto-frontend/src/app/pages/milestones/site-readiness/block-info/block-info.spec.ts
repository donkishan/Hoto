import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockInfo } from './block-info';

describe('BlockInfo', () => {
  let component: BlockInfo;
  let fixture: ComponentFixture<BlockInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
