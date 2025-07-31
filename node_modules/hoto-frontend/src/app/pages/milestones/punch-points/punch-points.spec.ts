import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PunchPoints } from './punch-points';

describe('PunchPoints', () => {
  let component: PunchPoints;
  let fixture: ComponentFixture<PunchPoints>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PunchPoints]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PunchPoints);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
