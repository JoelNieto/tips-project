import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '@tips/data/services';
import { catchError, map, of, switchMap, tap } from 'rxjs';

import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ request }) =>
        this.service.login(request).pipe(
          map((payload) => AuthActions.loginSuccess({ payload })),
          catchError((error) => of(AuthActions.loginFailure({ error })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => this.snackBar.open('Bienvenido'))
      );
    },
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly service: AuthService,
    private readonly snackBar: MatSnackBar
  ) {}
}
