import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule, Store } from '@ngrx/store';
import { NxModule } from '@nrwl/angular';
import { readFirst } from '@nrwl/angular/testing';

import * as SurveysActions from './surveys.actions';
import { SurveysEffects } from './surveys.effects';
import { SurveysFacade } from './surveys.facade';
import { SurveysEntity } from './surveys.models';
import {
  SURVEYS_FEATURE_KEY,
  State,
  initialState,
  reducer,
} from './surveys.reducer';
import * as SurveysSelectors from './surveys.selectors';

interface TestSchema {
  surveys: State;
}

describe('SurveysFacade', () => {
  let facade: SurveysFacade;
  let store: Store<TestSchema>;
  const createSurveysEntity = (id: string, name = ''): SurveysEntity => ({
    id,
    name: name || `name-${id}`,
  });

  describe('used in NgModule', () => {
    beforeEach(() => {
      @NgModule({
        imports: [
          StoreModule.forFeature(SURVEYS_FEATURE_KEY, reducer),
          EffectsModule.forFeature([SurveysEffects]),
        ],
        providers: [SurveysFacade],
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
      facade = TestBed.inject(SurveysFacade);
    });

    /**
     * The initially generated facade::loadAll() returns empty array
     */
    it('loadAll() should return empty list with loaded == true', async () => {
      let list = await readFirst(facade.allSurveys$);
      let isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(0);
      expect(isLoaded).toBe(false);

      facade.init();

      list = await readFirst(facade.allSurveys$);
      isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(0);
      expect(isLoaded).toBe(true);
    });

    /**
     * Use `loadSurveysSuccess` to manually update list
     */
    it('allSurveys$ should return the loaded list; and loaded flag == true', async () => {
      let list = await readFirst(facade.allSurveys$);
      let isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(0);
      expect(isLoaded).toBe(false);

      store.dispatch(
        SurveysActions.loadSurveysSuccess({
          surveys: [createSurveysEntity('AAA'), createSurveysEntity('BBB')],
        })
      );

      list = await readFirst(facade.allSurveys$);
      isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(2);
      expect(isLoaded).toBe(true);
    });
  });
});
