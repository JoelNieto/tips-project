import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { Assignment } from '@tips/data/models';

import { AssignmentsActions } from './assignments.actions';

export const ASSIGNMENTS_FEATURE_KEY = 'assignments';

export interface State extends EntityState<Assignment> {
  selectedId?: string | number; // which Assignments record has been selected
  loaded: boolean; // has the Assignments list been loaded
  error?: string | null; // last known error (if any)
}

export interface AssignmentsPartialState {
  readonly [ASSIGNMENTS_FEATURE_KEY]: State;
}

const selectId = (x: Assignment) => x._id;
export const assignmentsAdapter: EntityAdapter<Assignment> =
  createEntityAdapter<Assignment>({ selectId });

export const initialState: State = assignmentsAdapter.getInitialState({
  // set initial required properties
  loaded: false,
});

const assignmentsReducer = createReducer(
  initialState,
  on(
    AssignmentsActions.initAssignments,
    (state): State => ({
      ...state,
      loaded: false,
      error: null,
    })
  ),
  on(AssignmentsActions.loadAssignmentsSuccess, (state, { payload }) =>
    assignmentsAdapter.setAll(payload, { ...state, loaded: true })
  ),
  on(AssignmentsActions.createAssignmentSuccess, (state, { payload }) =>
    assignmentsAdapter.addOne(payload, state)
  )
);

export function reducer(state: State | undefined, action: Action) {
  return assignmentsReducer(state, action);
}
