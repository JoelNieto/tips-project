import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DetailsComponent } from './details/details.component';
import { EditSurveyComponent } from './edit-survey/edit-survey.component';
import { HomeComponent } from './home/home.component';
import { NewSurveyComponent } from './new-survey/new-survey.component';
import { SurveysComponent } from './surveys.component';

const routes: Routes = [
  {
    path: '',
    component: SurveysComponent,
    children: [
      { path: '', component: HomeComponent, title: 'Surveys' },
      { path: 'new', component: NewSurveyComponent, title: 'New' },
      { path: ':id', component: DetailsComponent },
      { path: ':id/edit', component: EditSurveyComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveysRoutingModule {}
