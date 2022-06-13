import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroupDirective, UntypedFormArray, UntypedFormGroup } from '@angular/forms';

import { FormService } from '../form.service';

@Component({
  selector: 'tips-measure-form',
  templateUrl: './measure-form.component.html',
  styleUrls: ['./measure-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeasureFormComponent implements OnInit {
  @Input() public index!: number;

  form!: UntypedFormGroup;
  constructor(
    private rootFormGroup: FormGroupDirective,
    private service: FormService
  ) {}

  ngOnInit(): void {
    const control = this.rootFormGroup.control.get(
      'measures'
    ) as UntypedFormArray;
    this.form = control.at(this.index) as UntypedFormGroup;
  }

  get questionArray() {
    return this.form.get('questions') as FormArray;
  }

  addQuestion = () => this.service.newQuestion.next(this.index);

  removeQuestion = (index: number) =>
    this.service.removeQuestion.next({ measure: this.index, index });
}
