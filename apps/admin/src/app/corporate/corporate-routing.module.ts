import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CompanyDetailsComponent } from './company-details/company-details.component';
import { CorporateComponent } from './corporate.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: CorporateComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'companies/:id', component: CompanyDetailsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorporateRoutingModule {}
