import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { SessionGuard } from '@tips/auth';

import { HomeComponent } from './home/home.component';
import { NavigationComponent } from './navigation/navigation.component';

export const routes: Routes = [
  {
    path: 'app',
    component: NavigationComponent,
    canActivate: [SessionGuard],
    canActivateChild: [SessionGuard],
    children: [
      { path: 'home', component: HomeComponent },
      {
        path: 'surveys',
        loadChildren: () =>
          import('./surveys/surveys.module').then((m) => m.SurveysModule),
      },
      {
        path: 'corporate',
        loadChildren: () =>
          import('./corporate/corporate.module').then((m) => m.CorporateModule),
      },
      { path: '', pathMatch: 'full', redirectTo: 'home' },
    ],
  },
  {
    path: 'auth',
    loadChildren: () => import('@tips/auth').then((m) => m.AuthModule),
  },
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
