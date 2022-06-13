import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Measure, Question } from '@tips/data/models';

import { SurveysFacade } from '../+state/surveys.facade';
import { FormService } from '../form.service';
import { FormStore } from './form-store/form.store';

@Component({
  selector: 'tips-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FormStore, FormService],
})
export class FormComponent implements OnInit, OnDestroy {
  types$ = this.state.allTypes$;
  form!: FormGroup;
  newQuestion$ = this.service.newQuestion;
  removeQuestion$ = this.service.removeQuestion;
  constructor(
    private readonly state: SurveysFacade,
    private readonly _fb: FormBuilder,
    private readonly store: FormStore,
    private readonly service: FormService
  ) {}

  ngOnDestroy(): void {
    this.newQuestion$.complete();
    this.removeQuestion$.complete();
  }

  ngOnInit(): void {
    this.newQuestion$.subscribe({
      next: (id) => this.addQuestion(id),
    });

    this.removeQuestion$.subscribe({
      next: ({ measure, index }) => this.removeQuestion(measure, index),
    });
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
      questions: this._fb.array([this.initQuestion()]),
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

  initQuestion(question?: Question): FormGroup {
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
    const control = this.form.get('measures') as FormArray;
    control.removeAt(i);
  }

  addQuestion(i: number) {
    const controls = this.form.get('measures') as FormArray;

    const measure = controls.at(i) as FormGroup;

    const questions = measure.get('questions') as FormArray;

    questions.push(this.initQuestion());
  }

  removeQuestion(measureId: number, index: number) {
    const measures = this.form.get('measures') as FormArray;
    const measure = measures.at(measureId);
    const questions = measure.get('questions') as FormArray;
    questions.removeAt(index);
  }
}
