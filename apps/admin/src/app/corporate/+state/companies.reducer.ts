import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { Company } from '@tips/data/models';

import { CompaniesActions } from './companies.actions';

export const COMPANIES_FEATURE_KEY = 'companies';

export interface State extends EntityState<Company> {
  selectedId?: string | number; // which Companies record has been selected
  loaded: boolean; // has the Companies list been loaded
  error?: string | null; // last known error (if any)
}

export interface CompaniesPartialState {
  readonly [COMPANIES_FEATURE_KEY]: State;
}

const selectId = (x: Company) => x._id;

export const companiesAdapter: EntityAdapter<Company> =
  createEntityAdapter<Company>({ selectId });

export const initialState: State = companiesAdapter.getInitialState({
  // set initial required properties
  loaded: false,
});

const companiesReducer = createReducer(
  initialState,
  on(
    CompaniesActions.init,
    (state): State => ({
      ...state,
      loaded: false,
      error: null,
    })
  ),
  on(
    CompaniesActions.loadCompaniesSuccess,
    (state, { payload }): State =>
      companiesAdapter.setAll(payload, { ...state, loaded: true })
  ),
  on(
    CompaniesActions.loadCompaniesFailure,
    (state, { error }): State => ({
      ...state,
      error,
    })
  ),
  on(
    CompaniesActions.selectCompany,
    (state, { id }): State => ({ ...state, selectedId: id })
  ),
  on(
    CompaniesActions.createCompanySuccess,
    (state, { payload }): State => companiesAdapter.addOne(payload, state)
  ),
  on(
    CompaniesActions.updateCompanySuccess,
    (state, { id, payload }): State =>
      companiesAdapter.updateOne({ changes: payload, id }, state)
  )
);

export function reducer(state: State | undefined, action: Action) {
  return companiesReducer(state, action);
}
