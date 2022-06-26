import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Profile } from '@tips/data/models';

import * as CompaniesSelectors from '../companies.selectors';
import * as PositionsSelectors from '../positions/positions.selectors';
import { EmployeesActions } from './employees.actions';
import * as EmployeesSelectors from './employees.selectors';

@Injectable()
export class EmployeesFacade {
  /**
   * Combine pieces of state using createSelector,
   * and expose them as observables through the facade.
   */
  loaded$ = this.store.select(EmployeesSelectors.selectEmployeesLoaded);
  allEmployees$ = this.store.select(EmployeesSelectors.selectAllEmployees);
  selectedEmployees$ = this.store.select(EmployeesSelectors.selectSelected);
  allPositions$ = this.store.select(PositionsSelectors.selectAllPositions);
  selectedCompany$ = this.store.select(CompaniesSelectors.selectSelected);
  constructor(private readonly store: Store) {}

  /**
   * Use the initialization action to perform one
   * or more tasks in your Effects.
   */
  init() {
    this.store.dispatch(EmployeesActions.init());
  }

  create(request: Profile) {
    this.store.dispatch(EmployeesActions.createEmployee({ request }));
  }

  update(id: string, request: Partial<Profile>) {
    this.store.dispatch(EmployeesActions.updateEmployee({ id, request }));
  }
}
