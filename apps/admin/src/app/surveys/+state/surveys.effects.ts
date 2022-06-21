import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { SurveysService } from '@tips/data/services';
import { catchError, map, of, switchMap } from 'rxjs';

import { SurveyTypesActions } from './survey-types/survey-types.actions';
import { SurveysActions } from './surveys.actions';

@Injectable()
export class SurveysEffects {
  init$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SurveysActions.init),
      switchMap(() =>
        this.service.getAll().pipe(
          map((surveys) => SurveysActions.loadSurveysSuccess({ surveys })),
          catchError((error) =>
            of(SurveysActions.loadSurveysFailure({ error }))
          )
        )
      )
    );
  });

  initTypes$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SurveysActions.init),
      map(() => SurveyTypesActions.load())
    );
  });

  create$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SurveysActions.createSurvey),
      switchMap(({ request }) =>
        this.service
          .post(request)
          .pipe(
            map((payload) => SurveysActions.createSurveySuccess({ payload }))
          )
      )
    );
  });

  edit$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SurveysActions.updateSurvey),
      switchMap(({ id, request }) =>
        this.service.patch(id, request).pipe(
          map((payload) => SurveysActions.updateSurveySuccess({ id, payload })),
          catchError((error) =>
            of(SurveysActions.updateSurveyFailure({ error }))
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
