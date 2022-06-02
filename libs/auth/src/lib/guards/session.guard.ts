import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';

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
    return of(true);
  }

  canActivateChild(): Observable<boolean | UrlTree> {
    return of(true);
  }
}
