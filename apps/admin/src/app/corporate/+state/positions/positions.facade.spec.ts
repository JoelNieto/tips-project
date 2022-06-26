import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule, Store } from '@ngrx/store';
import { NxModule } from '@nrwl/angular';
import { readFirst } from '@nrwl/angular/testing';

import * as PositionsActions from './positions.actions';
import { PositionsEffects } from './positions.effects';
import { PositionsFacade } from './positions.facade';
import { PositionsEntity } from './positions.models';
import {
  POSITIONS_FEATURE_KEY,
  State,
  initialState,
  reducer,
} from './positions.reducer';
import * as PositionsSelectors from './positions.selectors';

interface TestSchema {
  positions: State;
}

describe('PositionsFacade', () => {
  let facade: PositionsFacade;
  let store: Store<TestSchema>;
  const createPositionsEntity = (id: string, name = ''): PositionsEntity => ({
    id,
    name: name || `name-${id}`,
  });

  describe('used in NgModule', () => {
    beforeEach(() => {
      @NgModule({
        imports: [
          StoreModule.forFeature(POSITIONS_FEATURE_KEY, reducer),
          EffectsModule.forFeature([PositionsEffects]),
        ],
        providers: [PositionsFacade],
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
      facade = TestBed.inject(PositionsFacade);
    });

    /**
     * The initially generated facade::loadAll() returns empty array
     */
    it('loadAll() should return empty list with loaded == true', async () => {
      let list = await readFirst(facade.allPositions$);
      let isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(0);
      expect(isLoaded).toBe(false);

      facade.init();

      list = await readFirst(facade.allPositions$);
      isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(0);
      expect(isLoaded).toBe(true);
    });

    /**
     * Use `loadPositionsSuccess` to manually update list
     */
    it('allPositions$ should return the loaded list; and loaded flag == true', async () => {
      let list = await readFirst(facade.allPositions$);
      let isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(0);
      expect(isLoaded).toBe(false);

      store.dispatch(
        PositionsActions.loadPositionsSuccess({
          positions: [
            createPositionsEntity('AAA'),
            createPositionsEntity('BBB'),
          ],
        })
      );

      list = await readFirst(facade.allPositions$);
      isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(2);
      expect(isLoaded).toBe(true);
    });
  });
});
