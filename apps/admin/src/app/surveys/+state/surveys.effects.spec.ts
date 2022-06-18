import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { NxModule } from '@nrwl/angular';
import { hot } from 'jasmine-marbles';
import { Observable } from 'rxjs';

import { SurveysActions } from './surveys.actions';
import { SurveysEffects } from './surveys.effects';

describe('SurveysEffects', () => {
  let actions: Observable<Action>;
  let effects: SurveysEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NxModule.forRoot()],
      providers: [
        SurveysEffects,
        provideMockActions(() => actions),
        provideMockStore(),
      ],
    });

    effects = TestBed.inject(SurveysEffects);
  });

  describe('init$', () => {
    it('should work', () => {
      actions = hot('-a-|', { a: SurveysActions.init() });

      const expected = hot('-a-|', {
        a: SurveysActions.loadSurveysSuccess({ surveys: [] }),
      });

      expect(effects.init$).toBeObservable(expected);
    });
  });
});
