import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormArray, FormGroup, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Measure, Question } from '@tips/data/models';

import { SurveysFacade } from '../+state/surveys.facade';

@Component({
  selector: 'tips-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit {
  types$ = this.state.allTypes$;
  form!: UntypedFormGroup;
  constructor(
    private readonly state: SurveysFacade,
    private readonly _fb: UntypedFormBuilder
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
    return this.form.get('measures') as UntypedFormArray;
  }

  addMeasure() {
    const control = this.form.get('measures') as UntypedFormArray;
    control.push(this.initMeasure());
  }

  initQuestion(question?: Question): UntypedFormGroup {
    return this._fb.group({
      _id: [question?._id ?? null],
      title: [question?.title ?? ''],
      text: [
        question?.text ?? '',
        [Validators.required, Validators.minLength(5)],
      ],
      weighting: [
        question?.weighting ?? 10,
        [Validators.required, Validators.min],
      ],
      reverse: [question?.reverse ?? false],
    });
  }

  initExistingQuestion(measure: Measure): FormGroup[] {
    const controls: FormGroup[] = [];
    measure.questions.forEach((question) => {
      controls.push(this.initQuestion(question));
    });
    return controls;
  }

  removeMeasure(i: number): void {
    const control = this.form.get('measures') as UntypedFormArray;
    control.removeAt(i);
  }

  addQuestion(i: number) {
    const controls = this.form.get('measures') as FormArray;
    const measure = controls.at(i);
    const questions = measure.get('questions') as FormArray;
    questions.push(this.initQuestion());
  }
}
