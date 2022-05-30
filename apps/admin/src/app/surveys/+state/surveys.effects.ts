import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { SurveysService } from '@tips/data/services';
import { catchError, map, of, switchMap } from 'rxjs';

import { SurveysActions } from './surveys.actions';

@Injectable()
export class SurveysEffects {
  init$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SurveysActions.init),
      switchMap(() =>
        this.service.getAll().pipe(
          map(
            (surveys) => SurveysActions.loadSurveysSuccess({ surveys }),
            catchError((error) =>
              of(SurveysActions.loadSurveysFailure({ error }))
            )
          )
        )
      )
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly service: SurveysService
  ) {}
}