import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { SurveysActions } from './surveys.actions';
import * as SurveysSelectors from './surveys.selectors';

@Injectable()
export class SurveysFacade {
  /**
   * Combine pieces of state using createSelector,
   * and expose them as observables through the facade.
   */
  loaded$ = this.store.pipe(select(SurveysSelectors.getSurveysLoaded));
  allSurveys$ = this.store.pipe(select(SurveysSelectors.getAllSurveys));
  selectedSurveys$ = this.store.pipe(select(SurveysSelectors.getSelected));

  constructor(private readonly store: Store) {}

  /**
   * Use the initialization action to perform one
   * or more tasks in your Effects.
   */
  init() {
    this.store.dispatch(SurveysActions.init());
  }
}
