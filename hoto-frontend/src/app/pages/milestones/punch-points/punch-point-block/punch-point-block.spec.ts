import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PunchPointBlock } from './punch-point-block';

describe('PunchPointBlock', () => {
  let component: PunchPointBlock;
  let fixture: ComponentFixture<PunchPointBlock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PunchPointBlock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PunchPointBlock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
