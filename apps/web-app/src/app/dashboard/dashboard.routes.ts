import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home'),
  },
  {
    path: 'companies',
    loadComponent: () => import('../companies/companies-list'),
  },
  {
    path: 'companies/:id',
    loadComponent: () => import('../companies/company-form'),
  },
];
