import { createFeatureSelector, createSelector } from '@ngrx/store';

import { ASSIGNMENTS_FEATURE_KEY, assignmentsAdapter, State } from './assignments.reducer';

// Lookup the 'Assignments' feature state managed by NgRx
export const selectAssignmentsState = createFeatureSelector<State>(
  ASSIGNMENTS_FEATURE_KEY
);

const { selectAll, selectEntities } = assignmentsAdapter.getSelectors();

export const selectAssignmentsLoaded = createSelector(
  selectAssignmentsState,
  (state: State) => state.loaded
);

export const selectAssignmentsError = createSelector(
  selectAssignmentsState,
  (state: State) => state.error
);

export const selectAllAssignments = createSelector(
  selectAssignmentsState,
  (state: State) => selectAll(state)
);

export const selectAssignmentsEntities = createSelector(
  selectAssignmentsState,
  (state: State) => selectEntities(state)
);

export const selectSelectedId = createSelector(
  selectAssignmentsState,
  (state: State) => state.selectedId
);

export const selectSelected = createSelector(
  selectAssignmentsEntities,
  selectSelectedId,
  (entities, selectedId) => (selectedId ? entities[selectedId] : undefined)
);
