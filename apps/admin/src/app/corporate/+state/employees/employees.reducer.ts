import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { Profile } from '@tips/data/models';

import { EmployeesActions } from './employees.actions';

export const EMPLOYEES_FEATURE_KEY = 'employees';

export interface State extends EntityState<Profile> {
  selectedId?: string | number; // which Employees record has been selected
  loaded: boolean; // has the Employees list been loaded
  error?: string | null; // last known error (if any)
}

export interface EmployeesPartialState {
  readonly [EMPLOYEES_FEATURE_KEY]: State;
}

const selectId = (x: Profile) => x._id;

export const employeesAdapter: EntityAdapter<Profile> =
  createEntityAdapter<Profile>({ selectId });

export const initialState: State = employeesAdapter.getInitialState({
  // set initial required properties
  loaded: false,
});

const employeesReducer = createReducer(
  initialState,
  on(
    EmployeesActions.init,
    (state): State => ({
      ...state,
      loaded: false,
      error: null,
    })
  ),
  on(
    EmployeesActions.loadEmployeesSuccess,
    (state, { payload }): State =>
      employeesAdapter.setAll(payload, { ...state, loaded: true })
  ),
  on(
    EmployeesActions.loadEmployeesFailure,
    (state, { error }): State => ({
      ...state,
      error,
    })
  ),
  on(
    EmployeesActions.createEmployeeSuccess,
    (state, { payload }): State => employeesAdapter.addOne(payload, state)
  ),
  on(
    EmployeesActions.updateEmployeeSuccess,
    (state, { id, changes }): State =>
      employeesAdapter.updateOne({ id, changes }, state)
  )
);

export function reducer(state: State | undefined, action: Action) {
  return employeesReducer(state, action);
}
