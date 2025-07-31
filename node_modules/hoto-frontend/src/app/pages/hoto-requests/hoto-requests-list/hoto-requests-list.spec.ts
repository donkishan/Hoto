import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotoRequestsList } from './hoto-requests-list';

describe('HotoRequestsList', () => {
  let component: HotoRequestsList;
  let fixture: ComponentFixture<HotoRequestsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotoRequestsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotoRequestsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
