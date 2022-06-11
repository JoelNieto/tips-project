import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormGroupDirective, UntypedFormArray, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'tips-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionFormComponent implements OnInit {
  @Input() formGroupName!: number;
  form!: UntypedFormGroup;
  constructor(private rootFormGroup: FormGroupDirective) {}

  ngOnInit(): void {
    const control = this.rootFormGroup.control.get(
      'questions'
    ) as UntypedFormArray;
    this.form = control.at(this.formGroupName) as UntypedFormGroup;
  }
}
