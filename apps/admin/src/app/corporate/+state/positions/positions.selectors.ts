import { createFeatureSelector, createSelector } from '@ngrx/store';

import { POSITIONS_FEATURE_KEY, positionsAdapter, State } from './positions.reducer';

// Lookup the 'Positions' feature state managed by NgRx
export const selectPositionsState = createFeatureSelector<State>(
  POSITIONS_FEATURE_KEY
);

const { selectAll, selectEntities } = positionsAdapter.getSelectors();

export const selectPositionsLoaded = createSelector(
  selectPositionsState,
  (state: State) => state.loaded
);

export const selectPositionsError = createSelector(
  selectPositionsState,
  (state: State) => state.error
);

export const selectAllPositions = createSelector(
  selectPositionsState,
  (state: State) => selectAll(state)
);

export const selectPositionsEntities = createSelector(
  selectPositionsState,
  (state: State) => selectEntities(state)
);

export const selectSelectedId = createSelector(
  selectPositionsState,
  (state: State) => state.selectedId
);

export const selectSelected = createSelector(
  selectPositionsEntities,
  selectSelectedId,
  (entities, selectedId) => (selectedId ? entities[selectedId] : undefined)
);
