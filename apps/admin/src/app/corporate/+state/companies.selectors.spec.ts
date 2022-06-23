import { CompaniesEntity } from './companies.models';
import {
  companiesAdapter,
  CompaniesPartialState,
  initialState,
} from './companies.reducer';
import * as CompaniesSelectors from './companies.selectors';

describe('Companies Selectors', () => {
  const ERROR_MSG = 'No Error Available';
  const getCompaniesId = (it: CompaniesEntity) => it.id;
  const createCompaniesEntity = (id: string, name = '') =>
    ({
      id,
      name: name || `name-${id}`,
    } as CompaniesEntity);

  let state: CompaniesPartialState;

  beforeEach(() => {
    state = {
      companies: companiesAdapter.setAll(
        [
          createCompaniesEntity('PRODUCT-AAA'),
          createCompaniesEntity('PRODUCT-BBB'),
          createCompaniesEntity('PRODUCT-CCC'),
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

  describe('Companies Selectors', () => {
    it('getAllCompanies() should return the list of Companies', () => {
      const results = CompaniesSelectors.getAllCompanies(state);
      const selId = getCompaniesId(results[1]);

      expect(results.length).toBe(3);
      expect(selId).toBe('PRODUCT-BBB');
    });

    it('getSelected() should return the selected Entity', () => {
      const result = CompaniesSelectors.getSelected(state) as CompaniesEntity;
      const selId = getCompaniesId(result);

      expect(selId).toBe('PRODUCT-BBB');
    });

    it('getCompaniesLoaded() should return the current "loaded" status', () => {
      const result = CompaniesSelectors.getCompaniesLoaded(state);

      expect(result).toBe(true);
    });

    it('getCompaniesError() should return the current "error" state', () => {
      const result = CompaniesSelectors.getCompaniesError(state);

      expect(result).toBe(ERROR_MSG);
    });
  });
});
