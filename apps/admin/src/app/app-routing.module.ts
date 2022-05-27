import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NavigationComponent } from './navigation/navigation.component';

export const routes: Routes = [
  { path: '', component: NavigationComponent },
  {
    path: 'auth',
    loadChildren: () => import('@tips/auth').then((m) => m.AuthModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
