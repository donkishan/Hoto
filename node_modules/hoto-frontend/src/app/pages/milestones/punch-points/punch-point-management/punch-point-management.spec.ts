import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PunchPointManagement } from './punch-point-management';

describe('PunchPointManagement', () => {
  let component: PunchPointManagement;
  let fixture: ComponentFixture<PunchPointManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PunchPointManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PunchPointManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
