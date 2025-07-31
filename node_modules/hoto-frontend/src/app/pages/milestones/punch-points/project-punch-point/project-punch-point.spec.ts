import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectPunchPoint } from './project-punch-point';

describe('ProjectPunchPoint', () => {
  let component: ProjectPunchPoint;
  let fixture: ComponentFixture<ProjectPunchPoint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectPunchPoint]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectPunchPoint);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
