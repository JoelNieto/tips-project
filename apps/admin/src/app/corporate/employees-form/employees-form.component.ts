import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Profile } from '@tips/data/models';

import { EmployeesFacade } from '../+state/employees/employees.facade';

@Component({
  selector: 'tips-employees-form',
  templateUrl: './employees-form.component.html',
  styleUrls: ['./employees-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesFormComponent implements OnInit {
  form!: FormGroup;
  positions$ = this.store.allPositions$;
  constructor(
    @Inject(MAT_DIALOG_DATA) public employee: Profile,
    private readonly _fb: FormBuilder,
    private readonly store: EmployeesFacade,
    private readonly dialogRef: MatDialogRef<EmployeesFormComponent>
  ) {}

  ngOnInit(): void {
    this.store.selectedCompany$.subscribe({
      next: (company) => {
        this.form = this._fb.group({
          firstName: [this.employee?.firstName ?? '', [Validators.required]],
          lastName: [this.employee?.lastName ?? '', [Validators.required]],
          company: [company],
          documentId: [this.employee?.documentId, [Validators.required]],
          email: [
            this.employee?.email ?? '',
            [Validators.required, Validators.email],
          ],
          position: [this.employee?.position ?? null, [Validators.required]],
          birthDate: [this.employee?.birthDate ?? null, []],
          gender: [this.employee?.gender ?? 'other', [Validators.required]],
        });
      },
    });
  }

  saveChanges() {
    const { value } = this.form;
    if (this.employee) {
      this.store.update(this.employee._id, value);
    } else {
      this.store.create(value);
    }

    this.dialogRef.close();
  }

  compareFn = (item1: any, item2: any) =>
    item1 && item2 ? item1._id === item2._id : item1 === item2;
}
