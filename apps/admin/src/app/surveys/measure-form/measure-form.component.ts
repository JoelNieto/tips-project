import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'tips-measure-form',
  templateUrl: './measure-form.component.html',
  styleUrls: ['./measure-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeasureFormComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
