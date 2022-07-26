import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AssignmentDetailsComponent } from './assignment-details/assignment-details.component';
import { AssignmentsComponent } from './assignments.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: AssignmentsComponent,
    children: [
      { path: '', pathMatch: 'full', component: HomeComponent },
      { path: ':id', component: AssignmentDetailsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssignmentsRoutingModule {}
