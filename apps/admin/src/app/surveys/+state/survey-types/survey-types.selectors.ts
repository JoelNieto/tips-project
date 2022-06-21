import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromSurveyTypes from './survey-types.reducer';

export const selectSurveyTypesState =
  createFeatureSelector<fromSurveyTypes.State>(
    fromSurveyTypes.surveyTypesFeatureKey
  );

const { selectAll } = fromSurveyTypes.typesAdapter.getSelectors();

export const selectAllTypes = createSelector(
  selectSurveyTypesState,
  (state: fromSurveyTypes.State) => selectAll(state)
);
