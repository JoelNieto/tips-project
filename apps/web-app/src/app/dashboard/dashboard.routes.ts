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
  {
    path: 'survey-types',
    loadComponent: () => import('../survey-types/survey-types-list'),
  },
  {
    path: 'survey-types/:id',
    loadComponent: () => import('../survey-types/survey-type-form'),
  },
  {
    path: 'profile',
    loadComponent: () => import('../profile/profile'),
  },
];
