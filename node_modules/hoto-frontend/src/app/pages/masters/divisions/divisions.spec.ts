import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Divisions } from './divisions';

describe('Divisions', () => {
  let component: Divisions;
  let fixture: ComponentFixture<Divisions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Divisions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Divisions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
