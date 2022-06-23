import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Company } from '@tips/data/models';

import { CompaniesFacade } from '../+state/companies.facade';

@Component({
  selector: 'tips-companies-form',
  templateUrl: './companies-form.component.html',
  styleUrls: ['./companies-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompaniesFormComponent implements OnInit {
  form!: FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) private company: Company,
    private dialogRef: MatDialogRef<CompaniesFormComponent>,
    private readonly _fb: FormBuilder,
    private readonly store: CompaniesFacade
  ) {}

  ngOnInit(): void {
    this.form = this._fb.group({
      name: [this.company?.name ?? '', [Validators.required]],
      fullName: [this.company?.fullName ?? '', [Validators.required]],
      notes: [this.company?.notes ?? ''],
    });
  }

  saveChanges(): void {
    const { value } = this.form;
    if (!this.company) {
      this.store.createCompany(value);
    } else {
      this.store.updateCompany(this.company._id, value);
    }

    this.dialogRef.close();
  }
}
