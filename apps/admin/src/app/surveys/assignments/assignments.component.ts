import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Assignment } from '@tips/data/models';

import { AssignmentsFacade } from '../+state/assignment/assignments.facade';
import { AssignmentsFormComponent } from '../assignments-form/assignments-form.component';

@Component({
  selector: 'tips-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentsComponent implements OnInit {
  assignments$ = this.state.allAssignments$;
  displayColumns = ['title', 'survey', 'createdAt', 'updatedAt', 'actions'];
  dataSource = new MatTableDataSource<Assignment>();
  @ViewChild(MatSort) sort!: MatSort;
  constructor(private state: AssignmentsFacade, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.assignments$.subscribe({
      next: (assignments) => {
        this.dataSource.data = assignments;
        this.dataSource.sort = this.sort;
      },
    });
    this.state.init();
  }

  newAssignment(): void {
    this.dialog.open(AssignmentsFormComponent, { panelClass: 'medium-dialog' });
  }

  editAssignment(assignment: Assignment): void {
    this.dialog.open(AssignmentsFormComponent, {
      data: assignment,
      panelClass: 'medium-dialog',
    });
  }
}
