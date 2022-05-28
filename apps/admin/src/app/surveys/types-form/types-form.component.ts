import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'tips-types-form',
  templateUrl: './types-form.component.html',
  styleUrls: ['./types-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypesFormComponent implements OnInit {
  public form!: FormGroup;

  constructor(private readonly _fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this._fb.group({
      name: ['', [Validators.required]],
      hasRadar: [false, []],
      hasMeasure: [false, []],
      prefix: ['', []],
      measureName: ['', []],
      subMeasureName: ['', []],
      visibleMeasures: [false, []],
      instructions: ['', []],
      isRandom: [false, []],
    });
  }
}
