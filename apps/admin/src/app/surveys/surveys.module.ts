import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { AnswersEffects } from './+state/answers/answers.effects';
import * as fromAnswers from './+state/answers/answers.reducer';
import { SurveyTypesEffects } from './+state/survey-types/survey-types.effects';
import * as fromSurveyTypes from './+state/survey-types/survey-types.reducer';
import { SurveysEffects } from './+state/surveys.effects';
import { SurveysFacade } from './+state/surveys.facade';
import * as fromSurveys from './+state/surveys.reducer';
import { AnswerFormComponent } from './answer-form/answer-form.component';
import { AnswerSetsComponent } from './answer-sets/answer-sets.component';
import { DetailsComponent } from './details/details.component';
import { EditSurveyComponent } from './edit-survey/edit-survey.component';
import { FormService } from './form.service';
import { FormStore } from './form/form-store/form.store';
import { FormComponent } from './form/form.component';
import { HomeComponent } from './home/home.component';
import { ListComponent } from './list/list.component';
import { MeasureFormComponent } from './measure-form/measure-form.component';
import { NewSurveyComponent } from './new-survey/new-survey.component';
import { QuestionFormComponent } from './question-form/question-form.component';
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
    QuestionFormComponent,
    AnswerFormComponent,
    NewSurveyComponent,
    ListComponent,
    HomeComponent,
    EditSurveyComponent,
    AnswerSetsComponent,
    DetailsComponent,
  ],
  imports: [
    CommonModule,
    SurveysRoutingModule,
    MatTableModule,
    MatButtonModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    MatCardModule,
    MatSelectModule,
    MatTabsModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatExpansionModule,
    TranslateModule,
    StoreModule.forFeature(
      fromSurveys.SURVEYS_FEATURE_KEY,
      fromSurveys.reducer
    ),
    EffectsModule.forFeature([
      SurveysEffects,
      SurveyTypesEffects,
      AnswersEffects,
    ]),
    StoreModule.forFeature(
      fromSurveyTypes.surveyTypesFeatureKey,
      fromSurveyTypes.reducer
    ),
    StoreModule.forFeature(fromAnswers.answersFeatureKey, fromAnswers.reducer),
  ],
  providers: [SurveysFacade, FormStore, FormService],
})
export class SurveysModule {}
