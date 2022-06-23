import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup, FormGroupDirective } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { SurveysFacade } from '../+state/surveys.facade';
import { AnswerFormComponent } from '../answer-form/answer-form.component';

@Component({
  selector: 'tips-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionFormComponent implements OnInit {
  @Input() index!: number;
  form!: FormGroup;
  sets$ = this.store.allAnswers$;
  constructor(
    private rootFormGroup: FormGroupDirective,
    private dialog: MatDialog,
    private store: SurveysFacade
  ) {}

  ngOnInit(): void {
    const control = this.rootFormGroup.control.get('questions') as FormArray;
    this.form = control.at(this.index) as FormGroup;
  }

  addAnswerSet() {
    this.dialog.open(AnswerFormComponent, { width: '40vw' });
  }

  compareFn = (item1: any, item2: any) =>
    item1 && item2 ? item1._id === item2._id : item1 === item2;
}
