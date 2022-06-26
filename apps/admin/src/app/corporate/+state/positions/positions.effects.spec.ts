import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { NxModule } from '@nrwl/angular';
import { hot } from 'jasmine-marbles';
import { Observable } from 'rxjs';

import { PositionsActions } from './positions.actions';
import { PositionsEffects } from './positions.effects';

describe('PositionsEffects', () => {
  let actions: Observable<Action>;
  let effects: PositionsEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NxModule.forRoot()],
      providers: [
        PositionsEffects,
        provideMockActions(() => actions),
        provideMockStore(),
      ],
    });

    effects = TestBed.inject(PositionsEffects);
  });

  describe('init$', () => {
    it('should work', () => {
      actions = hot('-a-|', { a: PositionsActions.init() });

      const expected = hot('-a-|', {
        a: PositionsActions.loadPositionsSuccess({ positions: [] }),
      });

      expect(effects.init$).toBeObservable(expected);
    });
  });
});
