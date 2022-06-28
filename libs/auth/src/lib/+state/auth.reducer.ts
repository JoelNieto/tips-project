import { Action, createReducer, on } from '@ngrx/store';
import { User } from '@tips/data/models';

import { AuthActions } from './auth.actions';

export const AUTH_FEATURE_KEY = 'auth';

export interface State {
  user: User | undefined | null;
  token: string | undefined;
  logged: boolean; // has the Auth list been loaded
  error?: unknown | null; // last known error (if any)
}

export interface AuthPartialState {
  readonly [AUTH_FEATURE_KEY]: State;
}

export const initialState: State = {
  // set initial required properties
  user: undefined,
  token: undefined,
  logged: false,
  error: null,
};

const authReducer = createReducer(
  initialState,
  on(AuthActions.init, (state): State => ({ ...state, error: null })),
  on(
    AuthActions.loginSuccess,
    (state, { token }): State => ({ ...state, token })
  ),
  on(
    AuthActions.loadProfileSuccess,
    (state, { payload }): State => ({ ...state, user: payload, logged: true })
  )
);

export function reducer(state: State | undefined, action: Action) {
  return authReducer(state, action);
}
