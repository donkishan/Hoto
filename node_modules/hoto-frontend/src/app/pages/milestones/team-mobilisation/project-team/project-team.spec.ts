import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTeam } from './project-team';

describe('ProjectTeam', () => {
  let component: ProjectTeam;
  let fixture: ComponentFixture<ProjectTeam>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTeam]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTeam);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
