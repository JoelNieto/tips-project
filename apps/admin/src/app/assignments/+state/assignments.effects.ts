import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AssignmentsService } from '@tips/data/services';
import { map, switchMap } from 'rxjs';

import { AssignmentsActions } from './assignments.actions';

@Injectable()
export class AssignmentsEffects {
  init$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AssignmentsActions.initAssignments),
      switchMap(() =>
        this.service
          .getAll()
          .pipe(
            map((payload) =>
              AssignmentsActions.loadAssignmentsSuccess({ payload })
            )
          )
      )
    );
  });

  create$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AssignmentsActions.createAssignment),
      switchMap(({ request }) =>
        this.service
          .post(request)
          .pipe(
            map((payload) =>
              AssignmentsActions.createAssignmentSuccess({ payload })
            )
          )
      )
    );
  });

  constructor(
    private readonly actions$: Actions,
    private service: AssignmentsService
  ) {}
}
