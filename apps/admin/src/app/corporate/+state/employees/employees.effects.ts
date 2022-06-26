import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { ProfilesService } from '@tips/data/services';
import { catchError, map, of, switchMap } from 'rxjs';

import { CompaniesFacade } from '../companies.facade';
import { EmployeesActions } from './employees.actions';

@Injectable()
export class EmployeesEffects {
  init$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(EmployeesActions.init),
      concatLatestFrom(() => this.companies.selectedCompanies$),
      switchMap(([, company]) =>
        this.service.getCompanyProfiles(company?._id).pipe(
          map((payload) => EmployeesActions.loadEmployeesSuccess({ payload })),
          catchError((error) =>
            of(EmployeesActions.loadEmployeesFailure({ error }))
          )
        )
      )
    );
  });

  create$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(EmployeesActions.createEmployee),
      switchMap(({ request }) =>
        this.service.post(request).pipe(
          map((payload) => EmployeesActions.createEmployeeSuccess({ payload })),
          catchError((error) =>
            of(EmployeesActions.createEmployeeFailure({ error }))
          )
        )
      )
    );
  });

  update$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(EmployeesActions.updateEmployee),
      switchMap(({ id, request }) =>
        this.service.patch(id, request).pipe(
          map((changes) =>
            EmployeesActions.updateEmployeeSuccess({ id, changes })
          ),
          catchError((error) =>
            of(EmployeesActions.updateEmployeeFailure({ error }))
          )
        )
      )
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly service: ProfilesService,
    private readonly companies: CompaniesFacade
  ) {}
}
