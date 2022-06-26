import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';
import { SurveysService } from '@tips/data/services';
import { catchError, map, of, switchMap, tap } from 'rxjs';

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

  createSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(SurveysActions.createSurveySuccess),
        tap(() =>
          this.snackBar.open(
            this.translate.instant('Survey.Created'),
            undefined,
            { duration: 3000 }
          )
        ),
        map(({ payload }) =>
          this.router.navigate(['app', 'surveys', payload._id])
        )
      );
    },
    { dispatch: false }
  );

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

  updateSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(SurveysActions.updateSurveySuccess),
        tap(() =>
          this.snackBar.open(
            this.translate.instant('Survey.Updated'),
            undefined,
            { duration: 3000 }
          )
        ),
        map(({ id }) => this.router.navigate(['app', 'surveys', id]))
      );
    },
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly service: SurveysService,
    private readonly snackBar: MatSnackBar,
    private readonly translate: TranslateService,
    private readonly router: Router
  ) {}
}
