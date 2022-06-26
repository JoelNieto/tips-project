import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule, Store } from '@ngrx/store';
import { NxModule } from '@nrwl/angular';
import { readFirst } from '@nrwl/angular/testing';

import * as EmployeesActions from './employees.actions';
import { EmployeesEffects } from './employees.effects';
import { EmployeesFacade } from './employees.facade';
import { EmployeesEntity } from './employees.models';
import {
  EMPLOYEES_FEATURE_KEY,
  State,
  initialState,
  reducer,
} from './employees.reducer';
import * as EmployeesSelectors from './employees.selectors';

interface TestSchema {
  employees: State;
}

describe('EmployeesFacade', () => {
  let facade: EmployeesFacade;
  let store: Store<TestSchema>;
  const createEmployeesEntity = (id: string, name = ''): EmployeesEntity => ({
    id,
    name: name || `name-${id}`,
  });

  describe('used in NgModule', () => {
    beforeEach(() => {
      @NgModule({
        imports: [
          StoreModule.forFeature(EMPLOYEES_FEATURE_KEY, reducer),
          EffectsModule.forFeature([EmployeesEffects]),
        ],
        providers: [EmployeesFacade],
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
      facade = TestBed.inject(EmployeesFacade);
    });

    /**
     * The initially generated facade::loadAll() returns empty array
     */
    it('loadAll() should return empty list with loaded == true', async () => {
      let list = await readFirst(facade.allEmployees$);
      let isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(0);
      expect(isLoaded).toBe(false);

      facade.init();

      list = await readFirst(facade.allEmployees$);
      isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(0);
      expect(isLoaded).toBe(true);
    });

    /**
     * Use `loadEmployeesSuccess` to manually update list
     */
    it('allEmployees$ should return the loaded list; and loaded flag == true', async () => {
      let list = await readFirst(facade.allEmployees$);
      let isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(0);
      expect(isLoaded).toBe(false);

      store.dispatch(
        EmployeesActions.loadEmployeesSuccess({
          employees: [
            createEmployeesEntity('AAA'),
            createEmployeesEntity('BBB'),
          ],
        })
      );

      list = await readFirst(facade.allEmployees$);
      isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(2);
      expect(isLoaded).toBe(true);
    });
  });
});
