import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Company } from '@tips/data/models';

import { CompaniesActions } from './companies.actions';
import * as CompaniesSelectors from './companies.selectors';

@Injectable()
export class CompaniesFacade {
  /**
   * Combine pieces of state using createSelector,
   * and expose them as observables through the facade.
   */
  loaded$ = this.store.select(CompaniesSelectors.selectCompaniesLoaded);
  allCompanies$ = this.store.select(CompaniesSelectors.selectAllCompanies);
  selectedCompanies$ = this.store.select(CompaniesSelectors.selectSelected);

  constructor(private readonly store: Store) {}

  /**
   * Use the initialization action to perform one
   * or more tasks in your Effects.
   */
  init() {
    this.store.dispatch(CompaniesActions.init());
  }

  selectCompany(id: string) {
    this.store.dispatch(CompaniesActions.selectCompany({ id }));
  }

  loadCompanies() {
    this.store.dispatch(CompaniesActions.loadCompanies());
  }

  createCompany(request: Company) {
    this.store.dispatch(CompaniesActions.createCompany({ request }));
  }

  updateCompany(id: string, changes: Partial<Company>) {
    this.store.dispatch(CompaniesActions.updateCompany({ id, changes }));
  }
}
