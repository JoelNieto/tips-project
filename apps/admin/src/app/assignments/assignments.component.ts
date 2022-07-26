import { Component, OnInit } from '@angular/core';

import { AssignmentsFacade } from './+state/assignments.facade';

@Component({
  selector: 'tips-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss'],
})
export class AssignmentsComponent implements OnInit {
  constructor(private store: AssignmentsFacade) {}

  ngOnInit(): void {
    this.store.init();
  }
}
