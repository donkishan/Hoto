import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProjectsdashboard } from './create-projectsdashboard';

describe('CreateProjectsdashboard', () => {
  let component: CreateProjectsdashboard;
  let fixture: ComponentFixture<CreateProjectsdashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateProjectsdashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateProjectsdashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
