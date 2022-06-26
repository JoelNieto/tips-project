import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Project } from '@tips/data/models';

import { ProjectsFacade } from '../+state/projects/projects.facade';

@Component({
  selector: 'tips-projects-form',
  templateUrl: './projects-form.component.html',
  styleUrls: ['./projects-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsFormComponent implements OnInit {
  form!: FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) public project: Project,
    private readonly dialogRef: MatDialogRef<ProjectsFormComponent>,
    private _fb: FormBuilder,
    private readonly store: ProjectsFacade
  ) {}

  ngOnInit(): void {
    this.store.selectedCompany$.subscribe({
      next: (company) => {
        this.form = this._fb.group({
          company: [company, [Validators.required]],
          title: [this.project?.title ?? '', [Validators.required]],
          code: [this.project?.code ?? ''],
          description: [this.project?.description ?? ''],
          startDate: [this.project?.startDate ?? null, [Validators.required]],
          endDate: [this.project?.endDate ?? null],
        });
      },
    });
  }

  saveChanges() {
    const { value } = this.form;
    if (this.project) {
      this.store.update(this.project._id, value);
    } else {
      this.store.create(value);
    }
    this.dialogRef.close();
  }
}
