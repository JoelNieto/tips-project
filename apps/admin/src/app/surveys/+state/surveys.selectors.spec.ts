import { SurveysEntity } from './surveys.models';
import {
  surveysAdapter,
  SurveysPartialState,
  initialState,
} from './surveys.reducer';
import * as SurveysSelectors from './surveys.selectors';

describe('Surveys Selectors', () => {
  const ERROR_MSG = 'No Error Available';
  const getSurveysId = (it: SurveysEntity) => it.id;
  const createSurveysEntity = (id: string, name = '') =>
    ({
      id,
      name: name || `name-${id}`,
    } as SurveysEntity);

  let state: SurveysPartialState;

  beforeEach(() => {
    state = {
      surveys: surveysAdapter.setAll(
        [
          createSurveysEntity('PRODUCT-AAA'),
          createSurveysEntity('PRODUCT-BBB'),
          createSurveysEntity('PRODUCT-CCC'),
        ],
        {
          ...initialState,
          selectedId: 'PRODUCT-BBB',
          error: ERROR_MSG,
          loaded: true,
        }
      ),
    };
  });

  describe('Surveys Selectors', () => {
    it('getAllSurveys() should return the list of Surveys', () => {
      const results = SurveysSelectors.getAllSurveys(state);
      const selId = getSurveysId(results[1]);

      expect(results.length).toBe(3);
      expect(selId).toBe('PRODUCT-BBB');
    });

    it('getSelected() should return the selected Entity', () => {
      const result = SurveysSelectors.getSelected(state) as SurveysEntity;
      const selId = getSurveysId(result);

      expect(selId).toBe('PRODUCT-BBB');
    });

    it('getSurveysLoaded() should return the current "loaded" status', () => {
      const result = SurveysSelectors.getSurveysLoaded(state);

      expect(result).toBe(true);
    });

    it('getSurveysError() should return the current "error" state', () => {
      const result = SurveysSelectors.getSurveysError(state);

      expect(result).toBe(ERROR_MSG);
    });
  });
});
