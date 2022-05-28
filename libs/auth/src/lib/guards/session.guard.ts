import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { iif, mergeMap, Observable, of } from 'rxjs';

import { AuthFacade } from '../+state/auth.facade';

@Injectable({
  providedIn: 'root',
})
export class SessionGuard implements CanActivate, CanActivateChild {
  constructor(
    private readonly auth: AuthFacade,
    private readonly router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.logged$.pipe(
      mergeMap((logged) =>
        iif(() => logged, of(logged), of(this.router.createUrlTree(['/'])))
      )
    );
  }

  canActivateChild(): Observable<boolean | UrlTree> {
    return this.auth.logged$.pipe(
      mergeMap((logged) =>
        iif(() => logged, of(logged), of(this.router.createUrlTree(['/'])))
      )
    );
  }
}
