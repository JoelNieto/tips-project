import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Answer, AnswersSet } from '@tips/data/models';

import { SurveysFacade } from '../+state/surveys.facade';

@Component({
  selector: 'tips-answer-form',
  templateUrl: './answer-form.component.html',
  styleUrls: ['./answer-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnswerFormComponent implements OnInit {
  form!: FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) private set: AnswersSet,
    private readonly _fb: FormBuilder,
    private readonly store: SurveysFacade,
    private readonly dialogRef: MatDialogRef<AnswerFormComponent>
  ) {}

  ngOnInit(): void {
    this.form = this._fb.group({
      name: [this.set?.name ?? '', [Validators.required]],
      answers: this.set?.answers
        ? this._fb.array(this.initExistingAnswers(this.set.answers))
        : this._fb.array([this.initAnswer()]),
    });
  }

  initAnswer(answer?: Answer) {
    return this._fb.group({
      text: [answer?.text ?? '', [Validators.required]],
      value: [answer?.value ?? null, [Validators.required]],
    });
  }

  initExistingAnswers(answers: Answer[]): FormGroup[] {
    const controls: FormGroup[] = [];
    answers.forEach((item) => {
      controls.push(this.initAnswer(item));
    });
    return controls;
  }

  addAnswer() {
    this.answersArray.push(this.initAnswer());
  }

  removeAnswer(index: number) {
    this.answersArray.removeAt(index);
  }

  get answersArray() {
    return this.form.get('answers') as FormArray;
  }

  saveAnswerSet() {
    const { value } = this.form;
    this.store.createSet(value);
    this.dialogRef.close();
  }
}
