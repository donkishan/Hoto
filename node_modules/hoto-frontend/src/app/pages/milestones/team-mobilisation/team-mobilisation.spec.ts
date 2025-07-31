import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamMobilisation } from './team-mobilisation';

describe('TeamMobilisation', () => {
  let component: TeamMobilisation;
  let fixture: ComponentFixture<TeamMobilisation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamMobilisation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamMobilisation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
