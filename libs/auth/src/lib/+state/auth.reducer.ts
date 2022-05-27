import { Action, createReducer, on } from '@ngrx/store';
import { User } from '@tips/data/models';

import { AuthActions } from './auth.actions';

export const AUTH_FEATURE_KEY = 'auth';

export interface State {
  accessToken: string | undefined;
  user: User | undefined | null;
  logged: boolean; // has the Auth list been loaded
  error?: unknown | null; // last known error (if any)
}

export interface AuthPartialState {
  readonly [AUTH_FEATURE_KEY]: State;
}

export const initialState: State = {
  // set initial required properties
  accessToken: undefined,
  user: undefined,
  logged: false,
  error: null,
};

const authReducer = createReducer(
  initialState,
  on(AuthActions.init, (state) => ({ ...state, logged: false, error: null })),
  on(
    AuthActions.loginSuccess,
    (state, { payload }): State => ({
      ...state,
      logged: true,
      accessToken: payload.access_token,
    })
  ),
  on(
    AuthActions.loadProfileSuccess,
    (state, { payload }): State => ({ ...state, user: payload })
  )
);

export function reducer(state: State | undefined, action: Action) {
  return authReducer(state, action);
}
