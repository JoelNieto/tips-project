import { PositionsEntity } from './positions.models';
import {
  positionsAdapter,
  PositionsPartialState,
  initialState,
} from './positions.reducer';
import * as PositionsSelectors from './positions.selectors';

describe('Positions Selectors', () => {
  const ERROR_MSG = 'No Error Available';
  const getPositionsId = (it: PositionsEntity) => it.id;
  const createPositionsEntity = (id: string, name = '') =>
    ({
      id,
      name: name || `name-${id}`,
    } as PositionsEntity);

  let state: PositionsPartialState;

  beforeEach(() => {
    state = {
      positions: positionsAdapter.setAll(
        [
          createPositionsEntity('PRODUCT-AAA'),
          createPositionsEntity('PRODUCT-BBB'),
          createPositionsEntity('PRODUCT-CCC'),
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

  describe('Positions Selectors', () => {
    it('getAllPositions() should return the list of Positions', () => {
      const results = PositionsSelectors.getAllPositions(state);
      const selId = getPositionsId(results[1]);

      expect(results.length).toBe(3);
      expect(selId).toBe('PRODUCT-BBB');
    });

    it('getSelected() should return the selected Entity', () => {
      const result = PositionsSelectors.getSelected(state) as PositionsEntity;
      const selId = getPositionsId(result);

      expect(selId).toBe('PRODUCT-BBB');
    });

    it('getPositionsLoaded() should return the current "loaded" status', () => {
      const result = PositionsSelectors.getPositionsLoaded(state);

      expect(result).toBe(true);
    });

    it('getPositionsError() should return the current "error" state', () => {
      const result = PositionsSelectors.getPositionsError(state);

      expect(result).toBe(ERROR_MSG);
    });
  });
});
