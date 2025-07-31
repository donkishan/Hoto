import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteReadiness } from './site-readiness';

describe('SiteReadiness', () => {
  let component: SiteReadiness;
  let fixture: ComponentFixture<SiteReadiness>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteReadiness]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteReadiness);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
