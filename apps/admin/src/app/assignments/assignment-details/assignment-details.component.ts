import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

import { AssignmentsFacade } from '../+state/assignments.facade';
import * as AssignmentsSelectors from '../+state/assignments.selectors';

@Component({
  selector: 'tips-assignment-details',
  templateUrl: './assignment-details.component.html',
  styleUrls: ['./assignment-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentDetailsComponent implements OnInit, OnDestroy {
  assignment$ = this.store.select(AssignmentsSelectors.selectSelected);

  constructor(
    private readonly route: ActivatedRoute,
    private store: Store,
    private readonly state: AssignmentsFacade,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.state.selectedAssignmentId$.subscribe({
      next: (id) => console.log(id),
    });
    this.route.params.subscribe({
      next: (params) => {
        console.log(params['id']);
        this.state.setAssignment(params['id']);
      },
    });

    this.assignment$.subscribe({
      next: (assignment) => [this.title.setTitle(assignment?.title ?? '')],
    });
  }
  ngOnDestroy(): void {
    this.state.setAssignment(undefined);
  }
}
