import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpStatusCode,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, Observable, throwError } from 'rxjs';

import { AuthFacade } from '../+state/auth.facade';

@Injectable()
export class AccessInterceptor implements HttpInterceptor {
  constructor(
    private readonly auth: AuthFacade,
    private readonly router: Router
  ) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === HttpStatusCode.Unauthorized) {
          this.router.navigate(['/']);
          return EMPTY;
        }
        return throwError(() => err);
      })
    );
  }
}
