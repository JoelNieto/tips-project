import { Route } from '@angular/router';

import { authGuard, publicGuard } from './auth/auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login'),
    canActivate: [publicGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard-shell'),
    canActivate: [authGuard],
    loadChildren: () =>
      import('./dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
