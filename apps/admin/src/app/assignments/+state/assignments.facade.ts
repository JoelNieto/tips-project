import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { AssignmentsActions } from './assignments.actions';
import * as AssignmentsSelectors from './assignments.selectors';

@Injectable()
export class AssignmentsFacade {
  loaded$ = this.store.select(AssignmentsSelectors.selectAssignmentsLoaded);
  allAssignments$ = this.store.select(
    AssignmentsSelectors.selectAllAssignments
  );
  selectedAssignmentId$ = this.store.select(
    AssignmentsSelectors.selectSelectedId
  );
  selectedAssignment$ = this.store.select(AssignmentsSelectors.selectSelected);

  constructor(private readonly store: Store) {}

  init() {
    this.store.dispatch(AssignmentsActions.initAssignments());
  }

  setAssignment(id: string | undefined) {
    this.store.dispatch(AssignmentsActions.setAssignment({ id }));
  }
}
