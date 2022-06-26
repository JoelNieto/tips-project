import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { PositionsService } from '@tips/data/services';
import { catchError, map, of, switchMap } from 'rxjs';

import { CompaniesFacade } from '../companies.facade';
import { PositionsActions } from './positions.actions';

@Injectable()
export class PositionsEffects {
  init$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PositionsActions.init),
      concatLatestFrom(() => this.companies.selectedCompanies$),
      switchMap(([, company]) =>
        this.service
          .getCompanyPositions(company?._id)
          .pipe(
            map((positions) =>
              PositionsActions.loadPositionsSuccess({ positions })
            )
          )
      )
    );
  });

  create$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PositionsActions.createPosition),
      switchMap(({ request }) =>
        this.service.post(request).pipe(
          map((payload) => PositionsActions.createPositionSuccess({ payload })),
          catchError((error) =>
            of(PositionsActions.createPositionFailure({ error }))
          )
        )
      )
    );
  });

  update$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PositionsActions.updatePosition),
      switchMap(({ id, request }) =>
        this.service.patch(id, request).pipe(
          map((payload) =>
            PositionsActions.updatePositionSuccess({ id, payload })
          ),
          catchError((error) =>
            of(PositionsActions.updatePositionFailure({ error }))
          )
        )
      )
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly service: PositionsService,
    private readonly companies: CompaniesFacade
  ) {}
}
