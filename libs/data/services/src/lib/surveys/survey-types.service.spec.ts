import { TestBed } from '@angular/core/testing';

import { SurveyTypesService } from './survey-types.service';

describe('SurveyTypesService', () => {
  let service: SurveyTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SurveyTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
