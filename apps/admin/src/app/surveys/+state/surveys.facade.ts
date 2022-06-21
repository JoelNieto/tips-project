import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AnswersSet, Survey, SurveyType } from '@tips/data/models';

import { AnswersActions } from './answers/answers.actions';
import * as AnswersSelectors from './answers/answers.selectors';
import { SurveyTypesActions } from './survey-types/survey-types.actions';
import * as TypesSelectors from './survey-types/survey-types.selectors';
import { SurveysActions } from './surveys.actions';
import * as SurveysSelectors from './surveys.selectors';

@Injectable()
export class SurveysFacade {
  /**
   * Combine pieces of state using createSelector,
   * and expose them as observables through the facade.
   */
  loaded$ = this.store.select(SurveysSelectors.selectSurveysLoaded);
  allSurveys$ = this.store.select(SurveysSelectors.selectAllSurveys);
  selectedSurveys$ = this.store.select(SurveysSelectors.selectSelected);
  allTypes$ = this.store.select(TypesSelectors.selectAllTypes);
  allAnswers$ = this.store.select(AnswersSelectors.selectAllAnswers);
  constructor(private readonly store: Store) {}

  /**
   * Use the initialization action to perform one
   * or more tasks in your Effects.
   */
  init() {
    this.store.dispatch(SurveysActions.init());
  }

  create(request: Survey) {
    this.store.dispatch(SurveysActions.createSurvey({ request }));
  }

  update(id: string, request: Survey) {
    this.store.dispatch(SurveysActions.updateSurvey({ id, request }));
  }

  loadAnswers() {
    this.store.dispatch(AnswersActions.loadSets());
  }

  createSet(set: AnswersSet) {
    this.store.dispatch(AnswersActions.createSet({ request: set }));
  }

  setSurvey(id: string) {
    this.store.dispatch(SurveysActions.setSurvey({ id }));
  }

  loadTypes() {
    this.store.dispatch(SurveyTypesActions.load());
  }

  createType(request: SurveyType) {
    this.store.dispatch(SurveyTypesActions.createType({ request }));
  }
  updateType(id: string, request: Partial<SurveyType>) {
    this.store.dispatch(SurveyTypesActions.updateType({ id, request }));
  }
}
