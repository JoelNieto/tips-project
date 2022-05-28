import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SURVEYS_FEATURE_KEY, State, surveysAdapter } from './surveys.reducer';

// Lookup the 'Surveys' feature state managed by NgRx
export const getSurveysState =
  createFeatureSelector<State>(SURVEYS_FEATURE_KEY);

const { selectAll, selectEntities } = surveysAdapter.getSelectors();

export const getSurveysLoaded = createSelector(
  getSurveysState,
  (state: State) => state.loaded
);

export const getSurveysError = createSelector(
  getSurveysState,
  (state: State) => state.error
);

export const getAllSurveys = createSelector(getSurveysState, (state: State) =>
  selectAll(state)
);

export const getSurveysEntities = createSelector(
  getSurveysState,
  (state: State) => selectEntities(state)
);

export const getSelectedId = createSelector(
  getSurveysState,
  (state: State) => state.selectedId
);

export const getSelected = createSelector(
  getSurveysEntities,
  getSelectedId,
  (entities, selectedId) => (selectedId ? entities[selectedId] : undefined)
);
