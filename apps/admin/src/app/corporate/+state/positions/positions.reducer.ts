import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { Position } from '@tips/data/models';

import { PositionsActions } from './positions.actions';

export const POSITIONS_FEATURE_KEY = 'positions';

export interface State extends EntityState<Position> {
  selectedId?: string | number; // which Positions record has been selected
  loaded: boolean; // has the Positions list been loaded
  error?: string | null; // last known error (if any)
}

export interface PositionsPartialState {
  readonly [POSITIONS_FEATURE_KEY]: State;
}

const selectId = (x: Position) => x._id;

export const positionsAdapter: EntityAdapter<Position> =
  createEntityAdapter<Position>({ selectId });

export const initialState: State = positionsAdapter.getInitialState({
  // set initial required properties
  loaded: false,
});

const positionsReducer = createReducer(
  initialState,
  on(
    PositionsActions.init,
    (state): State => ({
      ...state,
      loaded: false,
      error: null,
    })
  ),
  on(
    PositionsActions.loadPositionsSuccess,
    (state, { positions }): State =>
      positionsAdapter.setAll(positions, { ...state, loaded: true })
  ),
  on(
    PositionsActions.loadPositionsFailure,
    (state, { error }): State => ({
      ...state,
      error,
    })
  ),
  on(
    PositionsActions.createPositionSuccess,
    (state, { payload }): State => positionsAdapter.addOne(payload, state)
  ),
  on(
    PositionsActions.updatePositionSuccess,
    (state, { id, payload }): State =>
      positionsAdapter.updateOne({ id, changes: payload }, state)
  )
);

export function reducer(state: State | undefined, action: Action) {
  return positionsReducer(state, action);
}
