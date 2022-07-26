import { Action } from '@ngrx/store';

import * as AssignmentsActions from './assignments.actions';
import { AssignmentsEntity } from './assignments.models';
import { State, initialState, reducer } from './assignments.reducer';

describe('Assignments Reducer', () => {
  const createAssignmentsEntity = (
    id: string,
    name = ''
  ): AssignmentsEntity => ({
    id,
    name: name || `name-${id}`,
  });

  describe('valid Assignments actions', () => {
    it('loadAssignmentsSuccess should return the list of known Assignments', () => {
      const assignments = [
        createAssignmentsEntity('PRODUCT-AAA'),
        createAssignmentsEntity('PRODUCT-zzz'),
      ];
      const action = AssignmentsActions.loadAssignmentsSuccess({ assignments });

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
