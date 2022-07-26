import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule, Store } from '@ngrx/store';
import { NxModule } from '@nrwl/angular';
import { readFirst } from '@nrwl/angular/testing';

import * as AssignmentsActions from './assignments.actions';
import { AssignmentsEffects } from './assignments.effects';
import { AssignmentsFacade } from './assignments.facade';
import { AssignmentsEntity } from './assignments.models';
import {
  ASSIGNMENTS_FEATURE_KEY,
  State,
  initialState,
  reducer,
} from './assignments.reducer';
import * as AssignmentsSelectors from './assignments.selectors';

interface TestSchema {
  assignments: State;
}

describe('AssignmentsFacade', () => {
  let facade: AssignmentsFacade;
  let store: Store<TestSchema>;
  const createAssignmentsEntity = (
    id: string,
    name = ''
  ): AssignmentsEntity => ({
    id,
    name: name || `name-${id}`,
  });

  describe('used in NgModule', () => {
    beforeEach(() => {
      @NgModule({
        imports: [
          StoreModule.forFeature(ASSIGNMENTS_FEATURE_KEY, reducer),
          EffectsModule.forFeature([AssignmentsEffects]),
        ],
        providers: [AssignmentsFacade],
      })
      class CustomFeatureModule {}

      @NgModule({
        imports: [
          NxModule.forRoot(),
          StoreModule.forRoot({}),
          EffectsModule.forRoot([]),
          CustomFeatureModule,
        ],
      })
      class RootModule {}
      TestBed.configureTestingModule({ imports: [RootModule] });

      store = TestBed.inject(Store);
      facade = TestBed.inject(AssignmentsFacade);
    });

    /**
     * The initially generated facade::loadAll() returns empty array
     */
    it('loadAll() should return empty list with loaded == true', async () => {
      let list = await readFirst(facade.allAssignments$);
      let isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(0);
      expect(isLoaded).toBe(false);

      facade.init();

      list = await readFirst(facade.allAssignments$);
      isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(0);
      expect(isLoaded).toBe(true);
    });

    /**
     * Use `loadAssignmentsSuccess` to manually update list
     */
    it('allAssignments$ should return the loaded list; and loaded flag == true', async () => {
      let list = await readFirst(facade.allAssignments$);
      let isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(0);
      expect(isLoaded).toBe(false);

      store.dispatch(
        AssignmentsActions.loadAssignmentsSuccess({
          assignments: [
            createAssignmentsEntity('AAA'),
            createAssignmentsEntity('BBB'),
          ],
        })
      );

      list = await readFirst(facade.allAssignments$);
      isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(2);
      expect(isLoaded).toBe(true);
    });
  });
});
