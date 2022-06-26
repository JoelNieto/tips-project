import { Action } from '@ngrx/store';

import { EmployeesActions } from './employees.actions';
import { EmployeesEntity } from './employees.models';
import { initialState, reducer, State } from './employees.reducer';

describe('Employees Reducer', () => {
  const createEmployeesEntity = (id: string, name = ''): EmployeesEntity => ({
    id,
    name: name || `name-${id}`,
  });

  describe('valid Employees actions', () => {
    it('loadEmployeesSuccess should return the list of known Employees', () => {
      const employees = [
        createEmployeesEntity('PRODUCT-AAA'),
        createEmployeesEntity('PRODUCT-zzz'),
      ];
      const action = EmployeesActions.loadEmployeesSuccess({ employees });

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
