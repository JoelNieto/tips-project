import { createFeatureSelector, createSelector } from '@ngrx/store';

import { State, SURVEYS_FEATURE_KEY, surveysAdapter } from './surveys.reducer';

// Lookup the 'Surveys' feature state managed by NgRx
export const selectSurveysState =
  createFeatureSelector<State>(SURVEYS_FEATURE_KEY);

const { selectAll, selectEntities } = surveysAdapter.getSelectors();

export const selectSurveysLoaded = createSelector(
  selectSurveysState,
  (state: State) => state.loaded
);

export const selectSurveysError = createSelector(
  selectSurveysState,
  (state: State) => state.error
);

export const selectAllSurveys = createSelector(
  selectSurveysState,
  (state: State) => selectAll(state)
);

export const selectSurveysEntities = createSelector(
  selectSurveysState,
  (state: State) => selectEntities(state)
);

export const selectSelectedId = createSelector(
  selectSurveysState,
  (state: State) => state.selectedId
);

export const selectSelected = createSelector(
  selectSurveysEntities,
  selectSelectedId,
  (entities, selectedId) => (selectedId ? entities[selectedId] : undefined)
);
