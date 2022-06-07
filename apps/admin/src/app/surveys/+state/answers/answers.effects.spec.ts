import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { AnswersEffects } from './answers.effects';

describe('AnswersEffects', () => {
  let actions$: Observable<any>;
  let effects: AnswersEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AnswersEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(AnswersEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
