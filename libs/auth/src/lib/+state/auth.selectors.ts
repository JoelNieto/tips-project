import { createFeatureSelector, createSelector } from '@ngrx/store';

import { AUTH_FEATURE_KEY, State } from './auth.reducer';

// Lookup the 'Auth' feature state managed by NgRx
export const getAuthState = createFeatureSelector<State>(AUTH_FEATURE_KEY);

export const selectToken = createSelector(
  getAuthState,
  (state: State) => state.accessToken
);

export const selectError = createSelector(
  getAuthState,
  (state: State) => state.error
);

export const selectLogged = createSelector(
  getAuthState,
  (state: State) => state?.logged
);
