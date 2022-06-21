import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EditSurveyComponent } from './edit-survey/edit-survey.component';
import { HomeComponent } from './home/home.component';
import { NewSurveyComponent } from './new-survey/new-survey.component';
import { SurveysComponent } from './surveys.component';

const routes: Routes = [
  {
    path: '',
    component: SurveysComponent,
    title: 'Surveys',
    children: [
      { path: '', component: HomeComponent },
      { path: 'new', component: NewSurveyComponent },
      { path: ':id', component: EditSurveyComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveysRoutingModule {}
