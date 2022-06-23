import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule, Store } from '@ngrx/store';
import { NxModule } from '@nrwl/angular';
import { readFirst } from '@nrwl/angular/testing';

import * as CompaniesActions from './companies.actions';
import { CompaniesEffects } from './companies.effects';
import { CompaniesFacade } from './companies.facade';
import { CompaniesEntity } from './companies.models';
import {
  COMPANIES_FEATURE_KEY,
  State,
  initialState,
  reducer,
} from './companies.reducer';
import * as CompaniesSelectors from './companies.selectors';

interface TestSchema {
  companies: State;
}

describe('CompaniesFacade', () => {
  let facade: CompaniesFacade;
  let store: Store<TestSchema>;
  const createCompaniesEntity = (id: string, name = ''): CompaniesEntity => ({
    id,
    name: name || `name-${id}`,
  });

  describe('used in NgModule', () => {
    beforeEach(() => {
      @NgModule({
        imports: [
          StoreModule.forFeature(COMPANIES_FEATURE_KEY, reducer),
          EffectsModule.forFeature([CompaniesEffects]),
        ],
        providers: [CompaniesFacade],
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
      facade = TestBed.inject(CompaniesFacade);
    });

    /**
     * The initially generated facade::loadAll() returns empty array
     */
    it('loadAll() should return empty list with loaded == true', async () => {
      let list = await readFirst(facade.allCompanies$);
      let isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(0);
      expect(isLoaded).toBe(false);

      facade.init();

      list = await readFirst(facade.allCompanies$);
      isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(0);
      expect(isLoaded).toBe(true);
    });

    /**
     * Use `loadCompaniesSuccess` to manually update list
     */
    it('allCompanies$ should return the loaded list; and loaded flag == true', async () => {
      let list = await readFirst(facade.allCompanies$);
      let isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(0);
      expect(isLoaded).toBe(false);

      store.dispatch(
        CompaniesActions.loadCompaniesSuccess({
          companies: [
            createCompaniesEntity('AAA'),
            createCompaniesEntity('BBB'),
          ],
        })
      );

      list = await readFirst(facade.allCompanies$);
      isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(2);
      expect(isLoaded).toBe(true);
    });
  });
});
