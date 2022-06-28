import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '@tips/data/services';
import { map, switchMap, tap } from 'rxjs';

import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ request }) =>
        this.service
          .login(request)
          .pipe(map(({ token }) => AuthActions.loginSuccess({ token })))
      )
    );
  });

  loginSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(() =>
        this.snackBar.open(this.translate.instant('Welcome'), undefined, {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        })
      ),
      map(() => AuthActions.loadProfile())
    );
  });

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
