import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Position } from '@tips/data/models';

import * as CompaniesSelectors from '../companies.selectors';
import { PositionsActions } from './positions.actions';
import * as PositionsSelectors from './positions.selectors';

@Injectable()
export class PositionsFacade {
  /**
   * Combine pieces of state using createSelector,
   * and expose them as observables through the facade.
   */
  loaded$ = this.store.select(PositionsSelectors.selectPositionsLoaded);
  allPositions$ = this.store.select(PositionsSelectors.selectAllPositions);
  selectedPositions$ = this.store.select(PositionsSelectors.selectSelected);
  selectedCompany = this.store.select(CompaniesSelectors.selectSelected);
  constructor(private readonly store: Store) {}

  /**
   * Use the initialization action to perform one
   * or more tasks in your Effects.
   */
  init() {
    this.store.dispatch(PositionsActions.init());
  }

  createPosition(request: Position) {
    this.store.dispatch(PositionsActions.createPosition({ request }));
  }

  updatePosition(id: string, request: Partial<Position>) {
    this.store.dispatch(PositionsActions.updatePosition({ id, request }));
  }
}
