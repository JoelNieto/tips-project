import { createFeatureSelector, createSelector } from '@ngrx/store';

import { EMPLOYEES_FEATURE_KEY, employeesAdapter, State } from './employees.reducer';

// Lookup the 'Employees' feature state managed by NgRx
export const selectEmployeesState = createFeatureSelector<State>(
  EMPLOYEES_FEATURE_KEY
);

const { selectAll, selectEntities } = employeesAdapter.getSelectors();

export const selectEmployeesLoaded = createSelector(
  selectEmployeesState,
  (state: State) => state.loaded
);

export const selectEmployeesError = createSelector(
  selectEmployeesState,
  (state: State) => state.error
);

export const selectAllEmployees = createSelector(
  selectEmployeesState,
  (state: State) => selectAll(state)
);

export const selectEmployeesEntities = createSelector(
  selectEmployeesState,
  (state: State) => selectEntities(state)
);

export const selectSelectedId = createSelector(
  selectEmployeesState,
  (state: State) => state.selectedId
);

export const selectSelected = createSelector(
  selectEmployeesEntities,
  selectSelectedId,
  (entities, selectedId) => (selectedId ? entities[selectedId] : undefined)
);
