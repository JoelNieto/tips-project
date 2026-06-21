import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService, type UserRole } from './auth.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.waitUntilReady();

  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};

export const publicGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.waitUntilReady();

  if (auth.isAuthenticated()) {
    return router.createUrlTree(['/dashboard']);
  }
  return true;
};

export function roleGuard(...roles: UserRole[]): CanActivateFn {
  return async (route) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    await auth.waitUntilReady();

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    const routeRoles = (route.data?.['roles'] as UserRole[] | undefined) ?? roles;
    if (auth.hasRole(...routeRoles)) {
      return true;
    }

    return router.createUrlTree(['/dashboard']);
  };
}
