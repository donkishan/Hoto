import { TestBed } from '@angular/core/testing';

import { Division } from './division';

describe('Division', () => {
  let service: Division;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Division);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
