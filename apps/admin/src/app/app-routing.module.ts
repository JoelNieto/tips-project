import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes, TitleStrategy } from '@angular/router';
import { SessionGuard } from '@tips/auth';
import { TitleStrategyService } from '@tips/util';

import { HomeComponent } from './home/home.component';
import { NavigationComponent } from './navigation/navigation.component';

export const routes: Routes = [
  {
    path: 'app',
    component: NavigationComponent,
    canActivate: [SessionGuard],
    canActivateChild: [SessionGuard],
    children: [
      { path: 'home', component: HomeComponent, title: 'Home' },
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
    title: 'Authentication',
  },
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
  providers: [{ provide: TitleStrategy, useClass: TitleStrategyService }],
})
export class AppRoutingModule {}
