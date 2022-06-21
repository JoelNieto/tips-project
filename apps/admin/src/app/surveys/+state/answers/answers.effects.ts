import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AnswersSetsService } from '@tips/data/services';
import { map, switchMap } from 'rxjs/operators';

import { AnswersActions } from './answers.actions';

@Injectable()
export class AnswersEffects {
  loadSets$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AnswersActions.loadSets),
      switchMap(() =>
        this.service
          .getAll()
          .pipe(map((payload) => AnswersActions.loadSetsSuccess({ payload })))
      )
    );
  });

  create$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AnswersActions.createSet),
      switchMap(({ request }) =>
        this.service
          .post(request)
          .pipe(map((payload) => AnswersActions.createSetSuccess({ payload })))
      )
    );
  });
  constructor(private actions$: Actions, private service: AnswersSetsService) {}
}
