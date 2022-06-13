import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'tips-answer-form',
  templateUrl: './answer-form.component.html',
  styleUrls: ['./answer-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnswerFormComponent implements OnInit {
  @Input() index!: number;

  form!: FormGroup;
  constructor(private rootFormGroup: FormGroupDirective) {}

  ngOnInit(): void {
    const control = this.rootFormGroup.control.get('questions') as FormArray;
    this.form = control.at(this.index) as FormGroup;
  }
}
