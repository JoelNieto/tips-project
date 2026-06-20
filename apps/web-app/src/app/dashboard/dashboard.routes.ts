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
    path: 'companies/new',
    loadComponent: () => import('../companies/company-form'),
  },
  {
    path: 'companies/:id/edit',
    loadComponent: () => import('../companies/company-form'),
  },
  {
    path: 'companies/:id/employees/new',
    loadComponent: () => import('../companies/employee-form'),
  },
  {
    path: 'companies/:id/employees/:employeeId/edit',
    loadComponent: () => import('../companies/employee-form'),
  },
  {
    path: 'companies/:id/employees/:employeeId',
    loadComponent: () => import('../companies/employee-home'),
  },
  {
    path: 'companies/:id',
    loadComponent: () => import('../companies/company-home'),
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
    path: 'answer-sets',
    loadComponent: () => import('../answer-sets/answer-set-list'),
  },
  {
    path: 'answer-sets/:id',
    loadComponent: () => import('../answer-sets/answer-set-form'),
  },
  {
    path: 'surveys',
    loadComponent: () => import('../surveys/surveys-list'),
  },
  {
    path: 'surveys/:surveyId/assignations/new',
    loadComponent: () =>
      import('../survey-assignations/survey-assignation-form'),
  },
  {
    path: 'surveys/:surveyId/assignations/:id/results',
    loadComponent: () =>
      import('../survey-assignations/survey-assignation-results-page'),
  },
  {
    path: 'surveys/:surveyId/assignations/:id',
    loadComponent: () =>
      import('../survey-assignations/survey-assignation-detail'),
  },
  {
    path: 'surveys/:surveyId/assignations',
    loadComponent: () =>
      import('../survey-assignations/survey-assignations-list'),
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
