import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { SurveyTypesEffects } from './survey-types.effects';

describe('SurveyTypesEffects', () => {
  let actions$: Observable<any>;
  let effects: SurveyTypesEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SurveyTypesEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(SurveyTypesEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
