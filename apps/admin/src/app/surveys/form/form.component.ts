import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Measure, Question } from '@tips/data/models';
import { first } from 'rxjs';

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

    this.state.loadAnswers();

    this.initForm();
  }

  initForm() {
    this.state.selectedSurveys$.subscribe({
      next: (survey) => {
        this.form = this._fb.group({
          title: [survey?.title ?? '', [Validators.required]],
          description: [survey?.description ?? '', []],
          type: [survey?.type ?? undefined, [Validators.required]],
          public: [survey?.public ?? false, []],
          final: [survey?.final ?? false, []],
          measures: survey?.measures
            ? this._fb.array(this.initExistingMeasure(survey.measures))
            : this._fb.array([this.initMeasure()]),
        });
      },
    });
  }

  initMeasure(measure?: Measure) {
    return this._fb.group({
      name: [measure?.name ?? '', [Validators.required]],
      weighting: [
        measure?.weighting ?? 10,
        [Validators.required, Validators.min(1)],
      ],
      questions: measure
        ? this._fb.array(this.initExistingQuestion(measure))
        : this._fb.array([this.initQuestion()]),
      description: [measure?.description ?? ''],
    });
  }

  initExistingMeasure(measures: Measure[]): FormGroup[] {
    const controls: FormGroup[] = [];
    measures.forEach((item) => {
      controls.push(this.initMeasure(item));
    });
    return controls;
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
      answersSet: [question?.answersSet ?? null, [Validators.required]],
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

  saveSurvey() {
    const { value } = this.form;
    this.state.selectedSurveys$.pipe(first()).subscribe({
      next: (survey) => {
        if (survey) {
          this.state.update(survey._id, value);
        } else {
          this.state.create(value);
        }
      },
    });
  }

  compareFn(item1: any, item2: any) {
    return item1 && item2 ? item1._id === item2._id : item1 === item2;
  }
}
