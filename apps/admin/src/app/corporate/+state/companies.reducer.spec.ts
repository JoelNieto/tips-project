import { Action } from '@ngrx/store';

import * as CompaniesActions from './companies.actions';
import { CompaniesEntity } from './companies.models';
import { State, initialState, reducer } from './companies.reducer';

describe('Companies Reducer', () => {
  const createCompaniesEntity = (id: string, name = ''): CompaniesEntity => ({
    id,
    name: name || `name-${id}`,
  });

  describe('valid Companies actions', () => {
    it('loadCompaniesSuccess should return the list of known Companies', () => {
      const companies = [
        createCompaniesEntity('PRODUCT-AAA'),
        createCompaniesEntity('PRODUCT-zzz'),
      ];
      const action = CompaniesActions.loadCompaniesSuccess({ companies });

      const result: State = reducer(initialState, action);

      expect(result.loaded).toBe(true);
      expect(result.ids.length).toBe(2);
    });
  });

  describe('unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as Action;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });
});
