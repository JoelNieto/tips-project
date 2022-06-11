import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'tips-measure-form',
  templateUrl: './measure-form.component.html',
  styleUrls: ['./measure-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeasureFormComponent implements OnInit {
  @Input() public formGroupName!: number;

  @Output() addQuestion = new EventEmitter();

  @Output() removeQuestion = new EventEmitter<number>();
  form!: UntypedFormGroup;
  constructor(private rootFormGroup: FormGroupDirective) {}
  ngOnInit(): void {
    const control = this.rootFormGroup.control.get('measures') as UntypedFormArray;
    this.form = control.at(this.formGroupName) as UntypedFormGroup;
  }
}
