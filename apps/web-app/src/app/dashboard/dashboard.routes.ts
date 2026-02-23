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
    path: 'question-bank',
    loadComponent: () => import('../question-bank/question-bank-list'),
  },
  {
    path: 'question-bank/:id',
    loadComponent: () => import('../question-bank/question-form'),
  },
  {
    path: 'surveys',
    loadComponent: () => import('../surveys/surveys-list'),
  },
  {
    path: 'surveys/:id',
    loadComponent: () => import('../surveys/survey-form'),
  },
  {
    path: 'profile',
    loadComponent: () => import('../profile/profile'),
  },
];
