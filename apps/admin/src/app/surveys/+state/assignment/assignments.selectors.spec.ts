import { AssignmentsEntity } from './assignments.models';
import {
  assignmentsAdapter,
  AssignmentsPartialState,
  initialState,
} from './assignments.reducer';
import * as AssignmentsSelectors from './assignments.selectors';

describe('Assignments Selectors', () => {
  const ERROR_MSG = 'No Error Available';
  const getAssignmentsId = (it: AssignmentsEntity) => it.id;
  const createAssignmentsEntity = (id: string, name = '') =>
    ({
      id,
      name: name || `name-${id}`,
    } as AssignmentsEntity);

  let state: AssignmentsPartialState;

  beforeEach(() => {
    state = {
      assignments: assignmentsAdapter.setAll(
        [
          createAssignmentsEntity('PRODUCT-AAA'),
          createAssignmentsEntity('PRODUCT-BBB'),
          createAssignmentsEntity('PRODUCT-CCC'),
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

  describe('Assignments Selectors', () => {
    it('getAllAssignments() should return the list of Assignments', () => {
      const results = AssignmentsSelectors.getAllAssignments(state);
      const selId = getAssignmentsId(results[1]);

      expect(results.length).toBe(3);
      expect(selId).toBe('PRODUCT-BBB');
    });

    it('getSelected() should return the selected Entity', () => {
      const result = AssignmentsSelectors.getSelected(
        state
      ) as AssignmentsEntity;
      const selId = getAssignmentsId(result);

      expect(selId).toBe('PRODUCT-BBB');
    });

    it('getAssignmentsLoaded() should return the current "loaded" status', () => {
      const result = AssignmentsSelectors.getAssignmentsLoaded(state);

      expect(result).toBe(true);
    });

    it('getAssignmentsError() should return the current "error" state', () => {
      const result = AssignmentsSelectors.getAssignmentsError(state);

      expect(result).toBe(ERROR_MSG);
    });
  });
});
