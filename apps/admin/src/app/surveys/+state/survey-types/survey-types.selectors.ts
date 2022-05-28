import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromSurveyTypes from './survey-types.reducer';

export const selectSurveyTypesState =
  createFeatureSelector<fromSurveyTypes.State>(
    fromSurveyTypes.surveyTypesFeatureKey
  );

const { selectAll, selectEntities } =
  fromSurveyTypes.typesAdapter.getSelectors();

export const getAllTypes = createSelector(
  selectSurveyTypesState,
  (state: fromSurveyTypes.State) => selectAll(state)
);
