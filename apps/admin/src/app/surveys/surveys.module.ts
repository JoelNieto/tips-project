import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SurveyTypesEffects } from './+state/survey-types/survey-types.effects';
import * as fromSurveyTypes from './+state/survey-types/survey-types.reducer';
import { SurveysEffects } from './+state/surveys.effects';
import { SurveysFacade } from './+state/surveys.facade';
import * as fromSurveys from './+state/surveys.reducer';
import { FormComponent } from './form/form.component';
import { MeasureFormComponent } from './measure-form/measure-form.component';
import { SurveysRoutingModule } from './surveys-routing.module';
import { SurveysComponent } from './surveys.component';
import { TypesFormComponent } from './types-form/types-form.component';
import { TypesComponent } from './types/types.component';

@NgModule({
  declarations: [
    SurveysComponent,
    FormComponent,
    TypesComponent,
    TypesFormComponent,
    MeasureFormComponent,
  ],
  imports: [
    CommonModule,
    SurveysRoutingModule,
    MatTableModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    MatCardModule,
    MatSelectModule,
    MatTabsModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatExpansionModule,
    StoreModule.forFeature(
      fromSurveys.SURVEYS_FEATURE_KEY,
      fromSurveys.reducer
    ),
    EffectsModule.forFeature([SurveysEffects, SurveyTypesEffects]),
    StoreModule.forFeature(
      fromSurveyTypes.surveyTypesFeatureKey,
      fromSurveyTypes.reducer
    ),
  ],
  providers: [SurveysFacade],
})
export class SurveysModule {}