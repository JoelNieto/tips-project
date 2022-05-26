import { Action } from '@ngrx/store';

import * as AuthActions from './auth.actions';
import { AuthEntity } from './auth.models';
import { State, initialState, reducer } from './auth.reducer';

describe('Auth Reducer', () => {
  const createAuthEntity = (id: string, name = ''): AuthEntity => ({
    id,
    name: name || `name-${id}`,
  });

  describe('valid Auth actions', () => {
    it('loadAuthSuccess should return the list of known Auth', () => {
      const auth = [
        createAuthEntity('PRODUCT-AAA'),
        createAuthEntity('PRODUCT-zzz'),
      ];
      const action = AuthActions.loadAuthSuccess({ auth });

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
