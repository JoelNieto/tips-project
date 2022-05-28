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
      /** An EMPTY observable only emits completion. Replace with your own observable API request */
      switchMap(() =>
        this.service
          .getAll()
          .pipe(map((types) => SurveyTypesActions.loadSuccess({ types })))
      )
    );
  });

  constructor(private actions$: Actions, private service: SurveyTypesService) {}
}
