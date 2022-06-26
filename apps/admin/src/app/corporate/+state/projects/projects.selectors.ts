import { createFeatureSelector, createSelector } from '@ngrx/store';

import { PROJECTS_FEATURE_KEY, projectsAdapter, State } from './projects.reducer';

// Lookup the 'Projects' feature state managed by NgRx
export const selectProjectsState =
  createFeatureSelector<State>(PROJECTS_FEATURE_KEY);

const { selectAll, selectEntities } = projectsAdapter.getSelectors();

export const selectProjectsLoaded = createSelector(
  selectProjectsState,
  (state: State) => state.loaded
);

export const selectProjectsError = createSelector(
  selectProjectsState,
  (state: State) => state.error
);

export const selectAllProjects = createSelector(
  selectProjectsState,
  (state: State) => selectAll(state)
);

export const selectProjectsEntities = createSelector(
  selectProjectsState,
  (state: State) => selectEntities(state)
);

export const selectSelectedId = createSelector(
  selectProjectsState,
  (state: State) => state.selectedId
);

export const selectSelected = createSelector(
  selectProjectsEntities,
  selectSelectedId,
  (entities, selectedId) => (selectedId ? entities[selectedId] : undefined)
);
