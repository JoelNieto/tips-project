import { Action } from '@ngrx/store';

import * as SurveysActions from './surveys.actions';
import { SurveysEntity } from './surveys.models';
import { State, initialState, reducer } from './surveys.reducer';

describe('Surveys Reducer', () => {
  const createSurveysEntity = (id: string, name = ''): SurveysEntity => ({
    id,
    name: name || `name-${id}`,
  });

  describe('valid Surveys actions', () => {
    it('loadSurveysSuccess should return the list of known Surveys', () => {
      const surveys = [
        createSurveysEntity('PRODUCT-AAA'),
        createSurveysEntity('PRODUCT-zzz'),
      ];
      const action = SurveysActions.loadSurveysSuccess({ surveys });

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
