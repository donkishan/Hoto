import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotoRequestView } from './hoto-request-view';

describe('HotoRequestView', () => {
  let component: HotoRequestView;
  let fixture: ComponentFixture<HotoRequestView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotoRequestView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotoRequestView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
