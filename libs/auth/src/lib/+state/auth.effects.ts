import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '@tips/data/services';
import { catchError, map, of, switchMap, tap } from 'rxjs';

import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ request }) =>
        this.service.login(request).pipe(
          map(({ token }) => AuthActions.loginSuccess({ token })),
          catchError((error) => of(AuthActions.loginFailure({ error })))
        )
      )
    );
  });

  loginSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(() =>
        this.snackBar.open(this.translate.instant('Welcome'), undefined, {
          panelClass: ['alert', 'success'],
        })
      ),
      map(() => AuthActions.loadProfile())
    );
  });

  loginFailure$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthActions.loginFailure),
        tap(({ error }) => console.error(error)),
        map(() =>
          this.snackBar.open(
            this.translate.instant('Something went wrong'),
            undefined,
            { panelClass: ['alert', 'failure'] }
          )
        )
      );
    },
    { dispatch: false }
  );

  loadProfile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.loadProfile),
      switchMap(() =>
        this.service
          .getProfile()
          .pipe(map((payload) => AuthActions.loadProfileSuccess({ payload })))
      )
    );
  });

  loadProfileSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthActions.loadProfileSuccess),
        map(() => this.router.navigate(['/app']))
      );
    },
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly service: AuthService,
    private readonly translate: TranslateService,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router
  ) {}
}
