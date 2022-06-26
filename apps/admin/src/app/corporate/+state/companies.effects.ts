import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CompaniesService } from '@tips/data/services';
import { catchError, map, of, switchMap } from 'rxjs';

import { CompaniesActions } from './companies.actions';

@Injectable()
export class CompaniesEffects {
  init$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompaniesActions.init),
      map(() => CompaniesActions.loadCompanies())
    );
  });

  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompaniesActions.loadCompanies),
      switchMap(() =>
        this.service.getAll().pipe(
          map((payload) => CompaniesActions.loadCompaniesSuccess({ payload })),
          catchError((error) =>
            of(CompaniesActions.loadCompaniesFailure({ error }))
          )
        )
      )
    );
  });

  create$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompaniesActions.createCompany),
      switchMap(({ request }) =>
        this.service
          .post(request)
          .pipe(
            map((payload) => CompaniesActions.createCompanySuccess({ payload }))
          )
      )
    );
  });

  update$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CompaniesActions.updateCompany),
      switchMap(({ id, changes }) =>
        this.service
          .patch(id, changes)
          .pipe(
            map((payload) =>
              CompaniesActions.updateCompanySuccess({ id, payload })
            )
          )
      )
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly service: CompaniesService
  ) {}
}
