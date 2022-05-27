import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Login } from '@tips/data/models';

import { AuthActions } from './auth.actions';
import * as AuthSelectors from './auth.selectors';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  /**
   * Combine pieces of state using createSelector,
   * and expose them as observables through the facade.
   */
  logged$ = this.store.select(AuthSelectors.selectLogged);
  error$ = this.store.select(AuthSelectors.selectError);
  token$ = this.store.select(AuthSelectors.selectToken);

  constructor(private readonly store: Store) {}

  /**
   * Use the initialization action to perform one
   * or more tasks in your Effects.
   */
  init() {
    this.store.dispatch(AuthActions.init());
  }

  login(request: Login) {
    this.store.dispatch(AuthActions.login({ request }));
  }
}
