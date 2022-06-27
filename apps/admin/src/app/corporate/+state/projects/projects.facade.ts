import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Project } from '@tips/data/models';

import * as CompaniesSelectors from '../companies.selectors';
import { ProjectsActions } from './projects.actions';
import * as ProjectsSelectors from './projects.selectors';

@Injectable()
export class ProjectsFacade {
  /**
   * Combine pieces of state using createSelector,
   * and expose them as observables through the facade.
   */
  loaded$ = this.store.select(ProjectsSelectors.selectProjectsLoaded);
  allProjects$ = this.store.select(ProjectsSelectors.selectAllProjects);
  selectedProjects$ = this.store.select(ProjectsSelectors.selectSelected);
  selectedCompany$ = this.store.select(CompaniesSelectors.selectSelected);

  constructor(private readonly store: Store) {}

  /**
   * Use the initialization action to perform one
   * or more tasks in your Effects.
   */
  init() {
    this.store.dispatch(ProjectsActions.init());
  }

  create(request: Project) {
    this.store.dispatch(ProjectsActions.createProject({ request }));
  }

  update(id: string, request: Project) {
    this.store.dispatch(ProjectsActions.updateProject({ id, request }));
  }

  setProject(id: string | undefined) {
    this.store.dispatch(ProjectsActions.setProject({ id }));
  }
}
