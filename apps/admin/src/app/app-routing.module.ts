import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SessionGuard } from '@tips/auth';

import { NavigationComponent } from './navigation/navigation.component';

export const routes: Routes = [
  {
    path: 'app',
    component: NavigationComponent,
    canActivate: [SessionGuard],
    canActivateChild: [SessionGuard],
    children: [
      {
        path: 'surveys',
        loadChildren: () =>
          import('./surveys/surveys.module').then((m) => m.SurveysModule),
      },
    ],
  },
  {
    path: 'auth',
    loadChildren: () => import('@tips/auth').then((m) => m.AuthModule),
  },
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
