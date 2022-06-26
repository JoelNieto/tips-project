import { Action } from '@ngrx/store';

import { PositionsActions } from './positions.actions';
import { PositionsEntity } from './positions.models';
import { initialState, reducer, State } from './positions.reducer';

describe('Positions Reducer', () => {
  const createPositionsEntity = (id: string, name = ''): PositionsEntity => ({
    id,
    name: name || `name-${id}`,
  });

  describe('valid Positions actions', () => {
    it('loadPositionsSuccess should return the list of known Positions', () => {
      const positions = [
        createPositionsEntity('PRODUCT-AAA'),
        createPositionsEntity('PRODUCT-zzz'),
      ];
      const action = PositionsActions.loadPositionsSuccess({ positions });

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
