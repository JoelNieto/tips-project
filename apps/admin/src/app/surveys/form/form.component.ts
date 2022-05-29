import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Measure } from '@tips/data/models';

import { SurveysFacade } from '../+state/surveys.facade';

@Component({
  selector: 'tips-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit {
  types$ = this.state.allTypes$;
  form!: FormGroup;
  constructor(
    private readonly state: SurveysFacade,
    private readonly _fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this._fb.group({
      title: ['', [Validators.required]],
      description: ['', []],
      type: [undefined, [Validators.required]],
      public: [false, []],
      final: [false, []],
      measures: this._fb.array([this.initMeasure()]),
    });
  }

  initMeasure(measure?: Measure) {
    return this._fb.group({
      _id: [measure?._id ?? null],
      name: [measure?.name ?? '', [Validators.required]],
      weighting: [
        measure?.weighting ?? 10,
        [Validators.required, Validators.min(1)],
      ],
      description: [measure?.description ?? ''],
    });
  }

  get measuresArray() {
    return this.form.get('measures') as FormArray;
  }

  addMeasure() {
    const control = this.form.get('measures') as FormArray;
    control.push(this.initMeasure());
  }

  removeMeasure(i: number) {
    const control = this.form.get('measures') as FormArray;
    control.removeAt(i);
  }
}
