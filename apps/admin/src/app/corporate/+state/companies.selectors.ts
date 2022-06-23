import { createFeatureSelector, createSelector } from '@ngrx/store';

import { COMPANIES_FEATURE_KEY, companiesAdapter, State } from './companies.reducer';

// Lookup the 'Companies' feature state managed by NgRx
export const selectCompaniesState = createFeatureSelector<State>(
  COMPANIES_FEATURE_KEY
);

const { selectAll, selectEntities } = companiesAdapter.getSelectors();

export const selectCompaniesLoaded = createSelector(
  selectCompaniesState,
  (state: State) => state.loaded
);

export const selectCompaniesError = createSelector(
  selectCompaniesState,
  (state: State) => state.error
);

export const selectAllCompanies = createSelector(
  selectCompaniesState,
  (state: State) => selectAll(state)
);

export const selectCompaniesEntities = createSelector(
  selectCompaniesState,
  (state: State) => selectEntities(state)
);

export const selectSelectedId = createSelector(
  selectCompaniesState,
  (state: State) => state.selectedId
);

export const selectSelected = createSelector(
  selectCompaniesEntities,
  selectSelectedId,
  (entities, selectedId) => (selectedId ? entities[selectedId] : undefined)
);
