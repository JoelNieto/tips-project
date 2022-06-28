import { createFeatureSelector, createSelector } from '@ngrx/store';

import { AUTH_FEATURE_KEY, State } from './auth.reducer';

// Lookup the 'Auth' feature state managed by NgRx
export const selectAuthState = createFeatureSelector<State>(AUTH_FEATURE_KEY);

export const selectError = createSelector(
  selectAuthState,
  (state: State) => state.error
);

export const selectLogged = createSelector(
  selectAuthState,
  (state: State) => state?.logged
);

export const selectProfile = createSelector(
  selectAuthState,
  (state: State) => state?.user
);

export const selectToken = createSelector(
  selectAuthState,
  (state: State) => state?.token
);
