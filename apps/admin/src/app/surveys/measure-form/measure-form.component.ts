import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'tips-measure-form',
  templateUrl: './measure-form.component.html',
  styleUrls: ['./measure-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeasureFormComponent {
  @Input()
  public form!: FormGroup;

  @Output() addQuestion = new EventEmitter();

  @Output() removeQuestion = new EventEmitter<number>();
}
