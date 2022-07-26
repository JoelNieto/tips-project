import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Assignment, Company, Project } from '@tips/data/models';
import { Subject, Subscription, switchMap } from 'rxjs';

import { AssignmentsFacade } from '../+state/assignment/assignments.facade';

@Component({
  selector: 'tips-assignments-form',
  templateUrl: './assignments-form.component.html',
  styleUrls: ['./assignments-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentsFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  projects$ = new Subject<Project[]>();
  companies$ = this.store.companies$;
  surveys$ = this.store.surveys$;
  subscription$ = new Subscription();

  constructor(
    @Inject(MAT_DIALOG_DATA) private assignment: Assignment,
    private store: AssignmentsFacade,
    private readonly _fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<AssignmentsFormComponent>
  ) {}

  ngOnInit(): void {
    // TODO: Add min Date for end Date
    this.form = this._fb.group({
      title: [this.assignment?.title ?? '', [Validators.required]],
      description: [this.assignment?.description ?? '', []],
      company: [this.assignment?.company],
      project: [this.assignment?.project, []],
      survey: [this.assignment?.survey, [Validators.required]],
      startDate: [this.assignment?.startDate],
      endDate: [this.assignment?.startDate],
    });

    this.subscription$.add(
      this.store
        .companyProjects(null)
        .subscribe({ next: (projects) => this.projects$.next(projects) })
    );
    this.subscription$.add(
      this.form
        .get('company')
        ?.valueChanges.pipe(
          switchMap((value: Company | undefined) =>
            this.store.companyProjects(value?._id ?? null)
          )
        )
        .subscribe({ next: (projects) => this.projects$.next(projects) })
    );

    this.subscription$.add(
      this.form.get('project')?.valueChanges.subscribe({
        next: (project: Project | undefined | null) => {
          const company = this.form.get('company')?.value;
          if (!company && project) {
            this.form.get('company')?.setValue(project.company);
          }
        },
      })
    );
  }

  saveChanges() {
    const { value } = this.form;
    this.store.create(value);
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.subscription$?.unsubscribe();
  }

  compareFn = (item1: any, item2: any) =>
    item1 && item2 ? item1._id === item2._id : item1 === item2;
}
