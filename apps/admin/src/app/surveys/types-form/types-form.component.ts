import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SurveyType } from '@tips/data/models';

import { SurveysFacade } from '../+state/surveys.facade';

@Component({
  selector: 'tips-types-form',
  templateUrl: './types-form.component.html',
  styleUrls: ['./types-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypesFormComponent implements OnInit {
  public form!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) private type: SurveyType,
    private dialogRef: MatDialogRef<TypesFormComponent>,
    private readonly _fb: FormBuilder,
    private store: SurveysFacade
  ) {}

  ngOnInit(): void {
    this.form = this._fb.group({
      name: [this.type?.name ?? '', [Validators.required]],
      hasRadar: [this.type?.hasRadar ?? false, []],
      hasBar: [this.type?.hasBar ?? false, []],
      hasMeasureQuestion: [this.type?.hasMeasureQuestion ?? false, []],
      prefix: [this.type?.prefix ?? '', []],
      measureName: [this.type?.measureName ?? '', []],
      subMeasureName: [this.type?.subMeasureName ?? '', []],
      visibleMeasures: [this.type?.visibleMeasures ?? false, []],
      instructions: [this.type?.instructions ?? '', []],
      isRandom: [this.type?.isRandom ?? false, []],
    });
  }

  saveChanges() {
    const { value } = this.form;
    if (!this.type) {
      this.store.createType(value);
    } else {
      this.store.updateType(this.type._id, value);
    }
    this.dialogRef.close();
  }
}
