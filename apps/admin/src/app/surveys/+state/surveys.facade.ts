import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Survey, SurveyType } from '@tips/data/models';

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
  loaded$ = this.store.select(SurveysSelectors.getSurveysLoaded);
  allSurveys$ = this.store.select(SurveysSelectors.getAllSurveys);
  selectedSurveys$ = this.store.select(SurveysSelectors.getSelected);
  allTypes$ = this.store.select(TypesSelectors.getAllTypes);
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
