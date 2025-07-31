import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotoRequests } from './hoto-requests';

describe('HotoRequests', () => {
  let component: HotoRequests;
  let fixture: ComponentFixture<HotoRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotoRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotoRequests);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
