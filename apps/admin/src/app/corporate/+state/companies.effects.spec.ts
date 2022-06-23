import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { NxModule } from '@nrwl/angular';
import { hot } from 'jasmine-marbles';
import { Observable } from 'rxjs';

import * as CompaniesActions from './companies.actions';
import { CompaniesEffects } from './companies.effects';

describe('CompaniesEffects', () => {
  let actions: Observable<Action>;
  let effects: CompaniesEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NxModule.forRoot()],
      providers: [
        CompaniesEffects,
        provideMockActions(() => actions),
        provideMockStore(),
      ],
    });

    effects = TestBed.inject(CompaniesEffects);
  });

  describe('init$', () => {
    it('should work', () => {
      actions = hot('-a-|', { a: CompaniesActions.init() });

      const expected = hot('-a-|', {
        a: CompaniesActions.loadCompaniesSuccess({ companies: [] }),
      });

      expect(effects.init$).toBeObservable(expected);
    });
  });
});
