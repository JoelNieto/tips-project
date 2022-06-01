import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { SurveyTypesService } from '@tips/data/services';
import { map } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { SurveyTypesActions } from './survey-types.actions';

@Injectable()
export class SurveyTypesEffects {
  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SurveyTypesActions.load),
      switchMap(() =>
        this.service
          .getAll()
          .pipe(map((types) => SurveyTypesActions.loadSuccess({ types })))
      )
    );
  });

  createType$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SurveyTypesActions.createType),
      switchMap(({ request }) =>
        this.service
          .post(request)
          .pipe(
            map((payload) => SurveyTypesActions.createTypeSuccess({ payload }))
          )
      )
    );
  });

  updateType$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SurveyTypesActions.updateType),
      switchMap(({ request, id }) =>
        this.service
          .update(id, request)
          .pipe(
            map((payload) =>
              SurveyTypesActions.updateTypeSuccess({ id, payload })
            )
          )
      )
    );
  });

  constructor(private actions$: Actions, private service: SurveyTypesService) {}
}
