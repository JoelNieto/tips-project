import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Assignment } from '@tips/data/models';
import { CompaniesService, ProjectsService } from '@tips/data/services';
import { shareReplay } from 'rxjs';

import * as SurveysSelectors from '../surveys.selectors';
import { AssignmentsActions } from './assignments.actions';
import * as AssignmentsSelectors from './assignments.selectors';

@Injectable()
export class AssignmentsFacade {
  /**
   * Combine pieces of state using createSelector,
   * and expose them as observables through the facade.
   */
  loaded$ = this.store.select(AssignmentsSelectors.selectAssignmentsLoaded);
  allAssignments$ = this.store.select(
    AssignmentsSelectors.selectAllAssignments
  );
  selectedAssignments$ = this.store.select(AssignmentsSelectors.selectSelected);
  projects$ = this.projects.getAll();
  companies$ = this.companies.getAll();
  surveys$ = this.store.select(SurveysSelectors.selectAllSurveys);
  constructor(
    private readonly store: Store,
    private readonly projects: ProjectsService,
    private readonly companies: CompaniesService
  ) {}

  /**
   * Use the initialization action to perform one
   * or more tasks in your Effects.
   */
  init() {
    this.store.dispatch(AssignmentsActions.initAssignments());
  }

  create(request: Assignment) {
    this.store.dispatch(AssignmentsActions.createAssignment({ request }));
  }

  companyProjects(id: string | null) {
    return id
      ? this.projects.getCompanyProjects(id).pipe(shareReplay(1))
      : this.projects.getAll().pipe(shareReplay(1));
  }
}
