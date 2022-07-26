import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { NxModule } from '@nrwl/angular';
import { hot } from 'jasmine-marbles';
import { Observable } from 'rxjs';

import * as AssignmentsActions from './assignments.actions';
import { AssignmentsEffects } from './assignments.effects';

describe('AssignmentsEffects', () => {
  let actions: Observable<Action>;
  let effects: AssignmentsEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NxModule.forRoot()],
      providers: [
        AssignmentsEffects,
        provideMockActions(() => actions),
        provideMockStore(),
      ],
    });

    effects = TestBed.inject(AssignmentsEffects);
  });

  describe('init$', () => {
    it('should work', () => {
      actions = hot('-a-|', { a: AssignmentsActions.init() });

      const expected = hot('-a-|', {
        a: AssignmentsActions.loadAssignmentsSuccess({ assignments: [] }),
      });

      expect(effects.init$).toBeObservable(expected);
    });
  });
});
