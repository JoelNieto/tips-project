import { Routes } from '@angular/router';

import { roleGuard } from '../auth/role.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home'),
  },
  {
    path: 'users',
    canActivate: [roleGuard('ADMIN')],
    loadComponent: () => import('../users/users-list'),
  },
  {
    path: 'users/new',
    canActivate: [roleGuard('ADMIN')],
    loadComponent: () => import('../users/user-form'),
  },
  {
    path: 'organizations',
    canActivate: [roleGuard('ADMIN', 'ORG_ADMIN')],
    loadComponent: () => import('../organizations/organizations-list'),
  },
  {
    path: 'organizations/new',
    canActivate: [roleGuard('ADMIN')],
    loadComponent: () => import('../organizations/organization-form'),
  },
  {
    path: 'organizations/:id',
    canActivate: [roleGuard('ADMIN', 'ORG_ADMIN')],
    loadComponent: () => import('../organizations/organization-detail'),
  },
  {
    path: 'companies',
    canActivate: [roleGuard('ADMIN', 'ORG_ADMIN')],
    loadComponent: () => import('../companies/companies-list'),
  },
  {
    path: 'companies/new',
    canActivate: [roleGuard('ADMIN')],
    loadComponent: () => import('../companies/company-form'),
  },
  {
    path: 'companies/:id/edit',
    canActivate: [roleGuard('ADMIN', 'ORG_ADMIN')],
    loadComponent: () => import('../companies/company-form'),
  },
  {
    path: 'companies/:id/employees/new',
    canActivate: [roleGuard('ADMIN', 'ORG_ADMIN')],
    loadComponent: () => import('../companies/employee-form'),
  },
  {
    path: 'companies/:id/employees/:employeeId/edit',
    canActivate: [roleGuard('ADMIN', 'ORG_ADMIN')],
    loadComponent: () => import('../companies/employee-form'),
  },
  {
    path: 'companies/:id/employees/:employeeId',
    canActivate: [roleGuard('ADMIN', 'ORG_ADMIN')],
    loadComponent: () => import('../companies/employee-home'),
  },
  {
    path: 'companies/:id',
    canActivate: [roleGuard('ADMIN', 'ORG_ADMIN')],
    loadComponent: () => import('../companies/company-home'),
  },
  {
    path: 'survey-types',
    canActivate: [roleGuard('ADMIN', 'DESIGNER')],
    loadComponent: () => import('../survey-types/survey-types-list'),
  },
  {
    path: 'survey-types/:id',
    canActivate: [roleGuard('ADMIN', 'DESIGNER')],
    loadComponent: () => import('../survey-types/survey-type-form'),
  },
  {
    path: 'question-bank',
    canActivate: [roleGuard('ADMIN', 'DESIGNER')],
    loadComponent: () => import('../question-bank/question-bank-list'),
  },
  {
    path: 'question-bank/:id',
    canActivate: [roleGuard('ADMIN', 'DESIGNER')],
    loadComponent: () => import('../question-bank/question-form'),
  },
  {
    path: 'answer-sets',
    canActivate: [roleGuard('ADMIN', 'DESIGNER')],
    loadComponent: () => import('../answer-sets/answer-set-list'),
  },
  {
    path: 'answer-sets/:id',
    canActivate: [roleGuard('ADMIN', 'DESIGNER')],
    loadComponent: () => import('../answer-sets/answer-set-form'),
  },
  {
    path: 'surveys',
    canActivate: [roleGuard('ADMIN', 'DESIGNER', 'ORG_ADMIN')],
    loadComponent: () => import('../surveys/surveys-list'),
  },
  {
    path: 'surveys/:surveyId/assignations/new',
    canActivate: [roleGuard('ADMIN', 'ORG_ADMIN')],
    loadComponent: () =>
      import('../survey-assignations/survey-assignation-form'),
  },
  {
    path: 'surveys/:surveyId/assignations/:id/results',
    canActivate: [roleGuard('ADMIN', 'ORG_ADMIN')],
    loadComponent: () =>
      import('../survey-assignations/survey-assignation-results-page'),
  },
  {
    path: 'surveys/:surveyId/assignations/:id',
    canActivate: [roleGuard('ADMIN', 'ORG_ADMIN')],
    loadComponent: () =>
      import('../survey-assignations/survey-assignation-detail'),
  },
  {
    path: 'surveys/:surveyId/assignations',
    canActivate: [roleGuard('ADMIN', 'ORG_ADMIN')],
    loadComponent: () =>
      import('../survey-assignations/survey-assignations-list'),
  },
  {
    path: 'surveys/:id',
    canActivate: [roleGuard('ADMIN', 'DESIGNER')],
    loadComponent: () => import('../surveys/survey-form'),
  },
  {
    path: 'profile',
    loadComponent: () => import('../profile/profile'),
  },
];
